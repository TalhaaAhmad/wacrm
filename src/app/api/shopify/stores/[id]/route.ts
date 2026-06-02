import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/whatsapp/encryption'

// ============================================================
// PATCH — Update a Shopify store
// ============================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('shopify_stores')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}
    let rotatedPlaintext: string | null = null

    if (body.store_name !== undefined) {
      updates.store_name = body.store_name.trim()
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active)
    }

    // Rotate webhook secret — keep plaintext so we can return it
    if (body.rotate_webhook_secret === true) {
      rotatedPlaintext = crypto.randomBytes(32).toString('hex')
      updates.webhook_secret = encrypt(rotatedPlaintext)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('shopify_stores')
      .update(updates)
      .eq('id', id)
      .select('id, shop_domain, store_name, is_active, created_at, updated_at')
      .single()

    if (error) {
      console.error('[shopify/stores] PATCH error:', error)
      return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
    }

    const response: Record<string, unknown> = { store: data }

    // Return the new webhook secret only when it was rotated.
    // This is the only time the plaintext is exposed — save it immediately.
    if (rotatedPlaintext) {
      response.webhook_secret = rotatedPlaintext
      response.webhook_url = `/api/shopify/webhook/${data.id}`
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[shopify/stores] PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// DELETE — Remove a Shopify store and its notification rules
// ============================================================

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('shopify_stores')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Delete notification rules first (CASCADE handles this, but explicit is cleaner)
    await supabase
      .from('shopify_notification_rules')
      .delete()
      .eq('store_id', id)

    // Delete the store
    const { error } = await supabase
      .from('shopify_stores')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[shopify/stores] DELETE error:', error)
      return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[shopify/stores] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
