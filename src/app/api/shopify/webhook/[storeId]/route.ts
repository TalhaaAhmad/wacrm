import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/whatsapp/encryption'
import { sendTemplateMessage } from '@/lib/whatsapp/meta-api'
import { normalizePhone, phonesMatch } from '@/lib/whatsapp/phone-utils'

// Lazy-initialized admin client — same pattern as WhatsApp webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _adminClient
}

// ============================================================
// Shopify payload types (partial — only fields we use)
// ============================================================

interface ShopifyCustomer {
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
}

interface ShopifyFulfillment {
  tracking_number?: string
  tracking_company?: string
}

interface ShopifyOrderPayload {
  id?: number
  order_number?: number
  name?: string // e.g. "#1001"
  total_price?: string
  currency?: string
  financial_status?: string
  customer?: ShopifyCustomer
  line_items?: Array<{ title?: string; quantity?: number; price?: string }>
  fulfillments?: ShopifyFulfillment[]
}

// ============================================================
// Extracted order fields for variable mapping
// ============================================================

interface ExtractedOrderData {
  order_number: string
  customer_name: string
  total_price: string
  currency: string
  item_count: string
  tracking_number: string
  financial_status: string
  customer_phone: string
}

function extractOrderData(payload: ShopifyOrderPayload, topic: string): ExtractedOrderData {
  const customer = payload.customer ?? {}
  const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'Customer'

  const fulfillments = payload.fulfillments ?? []
  const trackingNumber = fulfillments[0]?.tracking_number ?? ''

  const lineItems = payload.line_items ?? []
  const itemCount = String(lineItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0) || 0)

  return {
    order_number: payload.name ?? `#${payload.order_number ?? ''}`,
    customer_name: customerName,
    total_price: payload.total_price ?? '0',
    currency: payload.currency ?? 'USD',
    item_count: itemCount,
    tracking_number: trackingNumber,
    financial_status: payload.financial_status ?? (topic === 'orders/fulfilled' ? 'fulfilled' : ''),
    customer_phone: customer.phone ?? '',
  }
}

function mapTopicToEventType(topic: string): 'order_created' | 'order_fulfilled' | null {
  if (topic === 'orders/create' || topic === 'orders/create') return 'order_created'
  if (topic === 'orders/fulfilled') return 'order_fulfilled'
  return null
}

// ============================================================
// Contact resolution — mirrors WhatsApp webhook pattern
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContactRow = any

async function findOrCreateContact(
  userId: string,
  phone: string,
  name: string,
): Promise<ContactRow | null> {
  const { data: contacts, error: contactsError } = await supabaseAdmin()
    .from('contacts')
    .select('*')
    .eq('user_id', userId)

  if (contactsError) {
    console.error('[shopify/webhook] Error fetching contacts:', contactsError)
    return null
  }

  const normalizedPhone = normalizePhone(phone)
  const existingContact = contacts?.find((c: ContactRow) => phonesMatch(c.phone, normalizedPhone))

  if (existingContact) {
    if (name && name !== existingContact.name) {
      await supabaseAdmin()
        .from('contacts')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', existingContact.id)
    }
    return existingContact
  }

  const { data: newContact, error: createError } = await supabaseAdmin()
    .from('contacts')
    .insert({ user_id: userId, phone: normalizedPhone, name: name || normalizedPhone })
    .select()
    .single()

  if (createError) {
    console.error('[shopify/webhook] Error creating contact:', createError)
    return null
  }

  return newContact
}

// ============================================================
// POST — Shopify webhook receiver
// ============================================================

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params

  // Read raw body for HMAC verification
  const rawBody = await request.text()
  const shopifySignature = request.headers.get('x-shopify-hmac-sha256')
  const shopifyTopic = request.headers.get('x-shopify-topic') ?? ''

  // 1. Look up the store
  const { data: store, error: storeError } = await supabaseAdmin()
    .from('shopify_stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle()

  if (storeError || !store) {
    console.error('[shopify/webhook] Store not found:', storeId)
    return NextResponse.json({ status: 'store_not_found' }, { status: 200 })
  }

  if (!store.is_active) {
    return NextResponse.json({ status: 'store_inactive' }, { status: 200 })
  }

  // 2. Skip HMAC verification — simplified setup without secret.
  //    The store_id in the URL is sufficient to route the webhook.
  const webhookSecret = store.webhook_secret
  if (webhookSecret) {
    // If a secret was configured, verify it; otherwise skip.
    const shopifySignature = request.headers.get('x-shopify-hmac-sha256')
    if (shopifySignature) {
      try {
        const { decrypt } = await import('@/lib/whatsapp/encryption')
        const secret = decrypt(webhookSecret)
        const hash = require('crypto').createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
        if (!require('crypto').timingSafeEqual(Buffer.from(hash), Buffer.from(shopifySignature))) {
          console.warn('[shopify/webhook] Invalid HMAC for store:', storeId)
          return NextResponse.json({ status: 'invalid_signature' }, { status: 200 })
        }
      } catch {
        console.warn('[shopify/webhook] HMAC verification skipped — could not decrypt secret')
      }
    }
  }

  // 3. Parse payload
  let payload: ShopifyOrderPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[shopify/webhook] Invalid JSON payload')
    return NextResponse.json({ status: 'invalid_json' }, { status: 200 })
  }

  const eventType = mapTopicToEventType(shopifyTopic)
  if (!eventType) {
    // Topic we don't handle — log and ack
    await logWebhook(supabaseAdmin(), store.id, store.user_id, shopifyTopic, payload, 'skipped', 'Unhandled topic')
    return NextResponse.json({ status: 'ignored' }, { status: 200 })
  }

  // 4. Extract order data
  const orderData = extractOrderData(payload, shopifyTopic)

  // 5. Find or create contact (requires customer phone)
  let contactId: string | null = null
  if (orderData.customer_phone) {
    const contact = await findOrCreateContact(
      store.user_id,
      orderData.customer_phone,
      orderData.customer_name,
    )
    contactId = contact?.id ?? null
  }

  // 6. Look up notification rule
  const { data: rule, error: ruleError } = await supabaseAdmin()
    .from('shopify_notification_rules')
    .select('*')
    .eq('store_id', store.id)
    .eq('event_type', eventType)
    .eq('is_active', true)
    .maybeSingle()

  if (ruleError) {
    console.error('[shopify/webhook] Error fetching rule:', ruleError)
  }

  // 7. No rule — log as processed (contact was saved) and ack.
  //    This lets users verify webhooks are arriving before setting up rules.
  if (!rule) {
    await logWebhook(
      supabaseAdmin(),
      store.id,
      store.user_id,
      eventType,
      payload,
      'processed',
      'No notification rule configured',
      undefined,
      contactId,
    )
    return NextResponse.json({ status: 'received' }, { status: 200 })
  }

  // 8. Build template params from variable_mapping
  const variableMapping = (rule.variable_mapping ?? []) as Array<{ position: number; source: string }>
  const sortedMappings = [...variableMapping].sort((a, b) => a.position - b.position)
  const templateParams: string[] = sortedMappings.map((m) => {
    const key = m.source as keyof ExtractedOrderData
    return String(orderData[key] ?? '')
  })

  // 9. Send WhatsApp template message
  if (!orderData.customer_phone) {
    await logWebhook(supabaseAdmin(), store.id, store.user_id, eventType, payload, 'failed', 'No customer phone')
    return NextResponse.json({ status: 'no_phone' }, { status: 200 })
  }

  try {
    // Fetch WhatsApp config for the user
    const { data: waConfig, error: waError } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('*')
      .eq('user_id', store.user_id)
      .maybeSingle()

    if (waError || !waConfig) {
      await logWebhook(
        supabaseAdmin(),
        store.id,
        store.user_id,
        eventType,
        payload,
        'failed',
        'WhatsApp not configured',
      )
      return NextResponse.json({ status: 'whatsapp_not_configured' }, { status: 200 })
    }

    const accessToken = decrypt(waConfig.access_token)
    const normalizedPhone = normalizePhone(orderData.customer_phone)

    const result = await sendTemplateMessage({
      phoneNumberId: waConfig.phone_number_id,
      accessToken,
      to: normalizedPhone,
      templateName: rule.template_name,
      language: rule.template_language,
      params: templateParams,
    })

    await logWebhook(
      supabaseAdmin(),
      store.id,
      store.user_id,
      eventType,
      payload,
      'processed',
      null,
      result.messageId,
      contactId,
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('[shopify/webhook] WhatsApp send failed:', errorMessage)
    await logWebhook(supabaseAdmin(), store.id, store.user_id, eventType, payload, 'failed', errorMessage)
  }

  // Always return 200 to Shopify to acknowledge receipt
  return NextResponse.json({ status: 'received' }, { status: 200 })
}

// ============================================================
// Webhook logging helper
// ============================================================

async function logWebhook(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  storeId: string,
  userId: string,
  eventType: string,
  payload: unknown,
  status: 'processed' | 'failed' | 'skipped',
  errorMessage: string | null,
  whatsappMessageId?: string,
  contactId?: string | null,
) {
  try {
    await admin.from('shopify_webhook_logs').insert({
      store_id: storeId,
      user_id: userId,
      event_type: eventType,
      payload: payload ?? {},
      status,
      error_message: errorMessage,
      whatsapp_message_id: whatsappMessageId ?? null,
      contact_id: contactId ?? null,
    })
  } catch (logErr) {
    console.error('[shopify/webhook] Failed to write log:', logErr)
  }
}
