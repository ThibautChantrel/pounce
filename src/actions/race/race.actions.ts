'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { raceService } from '@/server/modules/race/race.service'
import {
  ActivityMode,
  RaceAccessType,
  RaceFormat,
  RaceStatus,
} from '@prisma/client'
import { CreateRaceInput, UpdateRaceInput } from './race.types'
import db from '@/server/db'
import { fetchStravaAthleteActivities } from '@/server/modules/strava/strava.client'
import { processStravaActivity } from '@/server/modules/strava/certification.service'

type ActionResponse = { success: boolean; error?: string; id?: string }

const raceSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  activityMode: z.nativeEnum(ActivityMode),
  format: z.nativeEnum(RaceFormat),
  accessType: z.nativeEnum(RaceAccessType),
  accessCode: z.string().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  loopDurationMinutes: z.number().int().positive().optional().nullable(),
  trackId: z.string().min(1),
  logoId: z.string().optional().nullable(),
  bannerId: z.string().optional().nullable(),
})

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  return session
}

export async function createRaceAction(
  data: CreateRaceInput
): Promise<ActionResponse> {
  const parsed = raceSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'invalid_data' }

  const now = new Date()
  if (parsed.data.startAt < now) {
    return { success: false, error: 'start_in_past' }
  }
  if (parsed.data.endAt <= parsed.data.startAt) {
    return { success: false, error: 'end_before_start' }
  }
  if (
    parsed.data.format === RaceFormat.BACKYARD &&
    parsed.data.loopDurationMinutes
  ) {
    const totalMinutes =
      (parsed.data.endAt.getTime() - parsed.data.startAt.getTime()) / 60_000
    if (totalMinutes % parsed.data.loopDurationMinutes !== 0) {
      return { success: false, error: 'backyard_loop_mismatch' }
    }
  }

  try {
    const session = await getSession()
    const result = await raceService.create(
      parsed.data,
      session.user.id,
      session.user.role
    )
    revalidatePath('/races')
    revalidatePath('/profile/races')
    return { success: true, id: result.id }
  } catch (err) {
    console.error('[createRace]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function updateRaceAction(
  data: UpdateRaceInput
): Promise<ActionResponse> {
  const parsed = raceSchema.partial().extend({ id: z.string() }).safeParse(data)
  if (!parsed.success) return { success: false, error: 'invalid_data' }

  try {
    const session = await getSession()
    await raceService.update(parsed.data, session.user.id, session.user.role)
    revalidatePath('/races')
    revalidatePath(`/races/${parsed.data.id}`)
    revalidatePath('/profile/races')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'Unauthorized') return { success: false, error: 'unauthorized' }
    return { success: false, error: 'internal_error' }
  }
}

export async function deleteRaceAction(id: string): Promise<ActionResponse> {
  try {
    const session = await getSession()
    await raceService.delete(id, session.user.id, session.user.role)
    revalidatePath('/races')
    revalidatePath('/profile/races')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'Unauthorized') return { success: false, error: 'unauthorized' }
    return { success: false, error: 'internal_error' }
  }
}

export async function getRaceAction(id: string) {
  return raceService.getById(id)
}

export async function listPublicRacesAction(params: {
  skip?: number
  take?: number
  search?: string
  formats?: string[]
  activityMode?: string
  statuses?: RaceStatus[]
}) {
  return raceService.listPublic(params)
}

export async function listMyRacesAction() {
  try {
    const session = await getSession()
    return raceService.listForOrganizer(session.user.id)
  } catch {
    return []
  }
}

const DEFAULT_AFTER_UNIX = Math.floor(
  new Date('2026-01-01T00:00:00Z').getTime() / 1000
)

export async function manualSyncRaceStravaAction(raceId: string): Promise<{
  success: boolean
  error?: string
  syncedActivities?: number
  syncedUsers?: number
}> {
  try {
    const session = await getSession()

    const race = await db.race.findUnique({
      where: { id: raceId },
      select: { organizerId: true },
    })
    if (!race) return { success: false, error: 'not_found' }
    if (race.organizerId !== session.user.id && session.user.role !== 'ADMIN') {
      return { success: false, error: 'unauthorized' }
    }

    const registrations = await db.raceRegistration.findMany({
      where: {
        raceId,
        status: { in: ['REGISTERED', 'VALIDATED', 'PENDING'] },
      },
      select: { userId: true },
    })

    const userIds = [...new Set(registrations.map((r) => r.userId))]

    let syncedActivities = 0
    let syncedUsers = 0

    for (const userId of userIds) {
      const stravaAccount = await db.account.findFirst({
        where: { userId, provider: 'strava' },
      })
      if (!stravaAccount) continue

      try {
        const lastCert = await db.trackCertification.findFirst({
          where: { userId, provider: 'strava' },
          orderBy: { completedAt: 'desc' },
          select: { completedAt: true },
        })
        const after = lastCert
          ? Math.floor(lastCert.completedAt.getTime() / 1000)
          : DEFAULT_AFTER_UNIX

        const activities = await fetchStravaAthleteActivities(userId, after)
        for (const activity of activities) {
          await processStravaActivity(userId, String(activity.id))
          syncedActivities++
        }
        syncedUsers++
      } catch {
        // skip athlete on error, continue with others
      }
    }

    return { success: true, syncedActivities, syncedUsers }
  } catch (err) {
    console.error('[manualSyncRaceStrava]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function createRaceTrackAction(data: {
  title: string
  distance: number
  elevationGain: number
  gpxFileId?: string | null
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const session = await getSession()
    const track = await db.track.create({
      data: {
        title: data.title,
        distance: data.distance,
        elevationGain: data.elevationGain,
        gpxFileId: data.gpxFileId ?? null,
        visible: false,
        createdById: session.user.id,
      },
      select: { id: true },
    })
    return { success: true, id: track.id }
  } catch {
    return { success: false, error: 'internal_error' }
  }
}

export async function searchTracksAction(query: string): Promise<
  {
    id: string
    title: string
    distance: number
    elevationGain: number
    gpxFileId: string | null
  }[]
> {
  if (!query.trim()) return []
  return db.track.findMany({
    where: { title: { contains: query.trim(), mode: 'insensitive' } },
    select: {
      id: true,
      title: true,
      distance: true,
      elevationGain: true,
      gpxFileId: true,
    },
    orderBy: { title: 'asc' },
    take: 10,
  })
}
