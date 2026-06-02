import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// DELETE — Remove a notification rule
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

    // Verify ownership via user_id on the rule row
    const { data: existing, error: fetchError } = await supabase
      .from('shopify_notification_rules')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('shopify_notification_rules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[shopify/rules] DELETE error:', error)
      return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[shopify/rules] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
