import { NextRequest, NextResponse } from 'next/server'
import { getUserByStravaId } from '@/server/modules/strava/strava.client'
import { processStravaActivity } from '@/server/modules/strava/certification.service'

/** Strava webhook verification handshake */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (
    mode === 'subscribe' &&
    token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  ) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

/** Strava webhook event handler */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only process new activities
  if (body.object_type !== 'activity' || body.aspect_type !== 'create') {
    return NextResponse.json({ ok: true })
  }

  const stravaAthleteId = String(body.owner_id)
  const stravaActivityId = String(body.object_id)

  const user = await getUserByStravaId(stravaAthleteId)
  if (!user) return NextResponse.json({ ok: true })

  // Fire and forget — Strava expects a fast 200 response
  processStravaActivity(user.id, stravaActivityId).catch((err) => {
    console.error('[strava-webhook] certification error', err)
  })

  return NextResponse.json({ ok: true })
}
