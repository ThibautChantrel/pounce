import db from '@/server/db'

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_API_BASE = 'https://www.strava.com/api/v3'

export type StravaActivity = {
  id: number
  name: string
  sport_type: string
  type: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  start_date: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  map: {
    summary_polyline: string | null
  }
}

async function getValidAccessToken(userId: string): Promise<string> {
  const account = await db.account.findFirst({
    where: { userId, provider: 'strava' },
  })

  if (!account) throw new Error('No Strava account linked')
  if (!account.access_token) throw new Error('No Strava access token')

  const nowSeconds = Math.floor(Date.now() / 1000)
  const isExpired = account.expires_at && account.expires_at < nowSeconds + 60

  if (!isExpired) return account.access_token

  if (!account.refresh_token) throw new Error('No Strava refresh token')

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
    }),
  })

  if (!res.ok) throw new Error('Failed to refresh Strava token')

  const data = await res.json()

  await db.account.update({
    where: {
      provider_providerAccountId: {
        provider: 'strava',
        providerAccountId: account.providerAccountId,
      },
    },
    data: {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? account.refresh_token,
      expires_at: data.expires_at,
    },
  })

  return data.access_token as string
}

export async function fetchStravaActivity(
  userId: string,
  activityId: string
): Promise<StravaActivity> {
  const token = await getValidAccessToken(userId)

  const res = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`Strava activity fetch failed: ${res.status}`)

  return res.json() as Promise<StravaActivity>
}

export async function fetchStravaAthleteActivities(
  userId: string,
  after: number
): Promise<Array<{ id: number }>> {
  const token = await getValidAccessToken(userId)
  const all: Array<{ id: number }> = []
  let page = 1

  while (true) {
    const url = `${STRAVA_API_BASE}/athlete/activities?after=${after}&per_page=200&page=${page}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok)
      throw new Error(`Strava activities fetch failed: ${res.status}`)

    const batch = (await res.json()) as Array<{ id: number }>
    if (batch.length === 0) break
    all.push(...batch)
    if (batch.length < 200) break
    page++
  }

  return all
}

export async function getUserByProviderAccountId(
  provider: string,
  providerAccountId: string
) {
  const account = await db.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  })
  return account?.user ?? null
}
