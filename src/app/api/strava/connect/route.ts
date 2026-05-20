import { auth } from '@/server/modules/auth/auth.config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = req.nextUrl.origin

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${origin}/api/strava/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })

  return NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params.toString()}`
  )
}
