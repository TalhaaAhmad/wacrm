import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// GET — List all Shopify stores for the current user
// ============================================================

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('shopify_stores')
      .select('id, shop_domain, store_name, is_active, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[shopify/stores] GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
    }

    return NextResponse.json({ stores: data ?? [] })
  } catch (err) {
    console.error('[shopify/stores] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// POST — Create a new Shopify store
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
    const { shop_domain, store_name } = body

    if (!shop_domain || !store_name) {
      return NextResponse.json(
        { error: 'shop_domain and store_name are required' },
        { status: 400 },
      )
    }

    // Normalize shop domain (lowercase, strip protocol/trailing slash)
    const normalizedDomain = shop_domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .trim()

    const { data, error } = await supabase
      .from('shopify_stores')
      .insert({
        user_id: user.id,
        shop_domain: normalizedDomain,
        store_name: store_name.trim(),
        access_token: null,
        webhook_secret: null,
        is_active: true,
      })
      .select('id, shop_domain, store_name, is_active, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A store with this domain already exists' },
          { status: 409 },
        )
      }
      console.error('[shopify/stores] POST error:', error)
      return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
    }

    return NextResponse.json({
      store: data,
      webhook_url: `/api/shopify/webhook/${data.id}`,
    })
  } catch (err) {
    console.error('[shopify/stores] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
