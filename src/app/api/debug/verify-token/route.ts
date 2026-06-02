import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy-initialized admin client
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

/**
 * Debug endpoint to check stored verify tokens.
 * Returns the verify_token (decrypted) for the first config row.
 * Use this to confirm what token the app expects from Meta.
 */
export async function GET() {
  try {
    const { data: configs, error } = await supabaseAdmin()
      .from('whatsapp_config')
      .select('id, user_id, verify_token, status')
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!configs || configs.length === 0) {
      return NextResponse.json({ message: 'No whatsapp_config rows found' })
    }

    const config = configs[0]
    let decryptedToken = null
    if (config.verify_token) {
      try {
        const { decrypt } = await import('@/lib/whatsapp/encryption')
        decryptedToken = decrypt(config.verify_token)
      } catch {
        decryptedToken = '[failed to decrypt — wrong ENCRYPTION_KEY?]'
      }
    }

    return NextResponse.json({
      config_id: config.id,
      status: config.status,
      has_verify_token: !!config.verify_token,
      decrypted_verify_token: decryptedToken,
      note: 'This is the token Meta must send as hub.verify_token during webhook verification',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
