import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// GET — List notification rules for a store
// ============================================================

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store_id')

    if (!storeId) {
      return NextResponse.json({ error: 'store_id query param is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('shopify_notification_rules')
      .select('*')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .order('event_type')

    if (error) {
      console.error('[shopify/rules] GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
    }

    return NextResponse.json({ rules: data ?? [] })
  } catch (err) {
    console.error('[shopify/rules] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// POST — Create or update a notification rule (upsert)
// ============================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { store_id, event_type, template_name, template_language, variable_mapping, is_active } = body

    console.log('[shopify/rules] Received:', { store_id, event_type, template_name, is_active, variable_mapping })

    if (!store_id || !event_type || !template_name) {
      return NextResponse.json(
        { error: 'store_id, event_type, and template_name are required' },
        { status: 400 },
      )
    }

    // Validate event_type
    if (!['order_created', 'order_fulfilled'].includes(event_type)) {
      return NextResponse.json(
        { error: 'event_type must be order_created or order_fulfilled' },
        { status: 400 },
      )
    }

    // Verify the store belongs to the user
    const { data: store, error: storeError } = await supabase
      .from('shopify_stores')
      .select('id')
      .eq('id', store_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Upsert on (store_id, event_type) — the migration creates a UNIQUE
    // constraint on that pair.
    const { data, error } = await supabase
      .from('shopify_notification_rules')
      .upsert(
        {
          store_id,
          user_id: user.id,
          event_type,
          template_name: template_name.trim(),
          template_language: template_language?.trim() || 'en_US',
          variable_mapping: variable_mapping ?? [],
          is_active: is_active !== undefined ? Boolean(is_active) : true,
        },
        { onConflict: 'store_id,event_type' },
      )
      .select('*')
      .single()

    if (error) {
      console.error('[shopify/rules] POST error:', error)
      return NextResponse.json({ error: 'Failed to save rule' }, { status: 500 })
    }

    return NextResponse.json({ rule: data })
  } catch (err) {
    console.error('[shopify/rules] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
