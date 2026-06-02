import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// GET — List webhook logs for a store
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
      .from('shopify_webhook_logs')
      .select('id, event_type, status, error_message, whatsapp_message_id, created_at')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[shopify/logs] GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }

    return NextResponse.json({ logs: data ?? [] })
  } catch (err) {
    console.error('[shopify/logs] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
