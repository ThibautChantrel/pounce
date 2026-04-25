import { auth } from '@/server/modules/auth/auth.config'
import db from '@/server/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  const origin = req.nextUrl.origin

  if (!session?.user?.id) {
    return NextResponse.redirect(`${origin}/`)
  }

  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/profile?strava=denied`)
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/profile?strava=error`)
  }

  const data = await tokenRes.json()
  const stravaAthleteId = String(data.athlete?.id)

  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'strava',
        providerAccountId: stravaAthleteId,
      },
    },
    create: {
      userId: session.user.id,
      type: 'oauth',
      provider: 'strava',
      providerAccountId: stravaAthleteId,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      token_type: 'Bearer',
      scope: data.scope,
    },
    update: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    },
  })

  return NextResponse.redirect(`${origin}/profile?strava=connected`)
}
