import { NextRequest, NextResponse } from 'next/server'
import { getUserByProviderAccountId } from '@/server/modules/strava/strava.client'
import { processStravaActivity } from '@/server/modules/strava/certification.service'
import {
  createActivitySync,
  createErrorSync,
} from '@/server/modules/strava/sync-log.service'

const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
if (!VERIFY_TOKEN) {
  throw new Error('STRAVA_WEBHOOK_VERIFY_TOKEN env var is not set')
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.object_type !== 'activity' || body.aspect_type !== 'create') {
    return NextResponse.json({ ok: true })
  }

  const stravaAthleteId = String(body.owner_id)
  const stravaActivityId = String(body.object_id)

  const user = await getUserByProviderAccountId('strava', stravaAthleteId)
  if (!user)
    return NextResponse.json({ ok: true })

    // Fire and forget — Strava expects a fast 200 response
  ;(async () => {
    try {
      const result = await processStravaActivity(user.id, stravaActivityId)
      await createActivitySync(user.id, 'strava', 'webhook', [
        result.activityLog,
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[strava-webhook] error', message)
      try {
        await createErrorSync(
          user.id,
          'strava',
          'webhook',
          stravaActivityId,
          message
        )
      } catch (logErr) {
        console.error('[strava-webhook] failed to log error', logErr)
      }
    }
  })()

  return NextResponse.json({ ok: true })
}
