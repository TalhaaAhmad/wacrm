import crypto from 'node:crypto'

/**
 * Verify the HMAC-SHA256 signature Meta attaches to webhook POSTs.
 *
 * Meta signs the raw request body with your App Secret and sends the
 * result in the `x-hub-signature-256: sha256=<hex>` header. Without
 * verification, anyone who knows our webhook URL can POST fabricated
 * status updates and drift broadcast counts arbitrarily.
 *
 * Reference:
 *   https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verify-payloads
 *
 * Contract:
 *   The `secret` is resolved per-request by the caller — either the
 *   per-account App Secret stored (encrypted) on `whatsapp_config`, or
 *   the global `META_APP_SECRET` env var as a fallback. Either way it is
 *   **required**: if it's empty/missing we fail closed and reject every
 *   request. Failing open would be unsafe for a public template —
 *   anyone who skipped configuring a secret would be running a fully
 *   spoofable webhook.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | null | undefined,
): boolean {
  if (!secret) {
    console.error(
      '[webhook] No app secret available — rejecting request. Set the ' +
        'Meta App Secret in Settings → WhatsApp (or the META_APP_SECRET ' +
        'env var) to enable signature verification.',
    )
    return false
  }

  if (!signatureHeader) return false
  if (!signatureHeader.startsWith('sha256=')) return false

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  const a = Buffer.from(signatureHeader)
  const b = Buffer.from(expected)
  // Bail if lengths differ — timingSafeEqual throws otherwise.
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
