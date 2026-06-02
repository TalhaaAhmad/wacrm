import { NextResponse } from 'next/server'

/**
 * Debug endpoint for verifying webhooks reach Vercel.
 * No signature validation — just logs everything and returns 200.
 * Remove or restrict this in production.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logs: any[] = []
const MAX_LOGS = 50

export async function POST(request: Request) {
  const rawBody = await request.text()
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  let parsedBody: unknown = null
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    parsedBody = { raw: rawBody.slice(0, 2000) }
  }

  const entry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers,
    body: parsedBody,
  }

  logs.unshift(entry)
  if (logs.length > MAX_LOGS) logs.pop()

  console.log('[debug/webhook] received:', JSON.stringify(entry, null, 2))

  return NextResponse.json({ status: 'logged', id: entry.timestamp }, { status: 200 })
}

export async function GET() {
  return NextResponse.json({
    count: logs.length,
    logs: logs.slice(0, 20),
  })
}
