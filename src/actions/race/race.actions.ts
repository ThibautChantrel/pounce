'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { raceService } from '@/server/modules/race/race.service'
import { ActivityMode, RaceAccessType, RaceFormat } from '@prisma/client'
import { CreateRaceInput, UpdateRaceInput } from './race.types'
import db from '@/server/db'

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
  format?: string
  activityMode?: string
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

export async function createRaceTrackAction(data: {
  title: string
  distance: number
  elevationGain: number
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const session = await getSession()
    const track = await db.track.create({
      data: {
        title: data.title,
        distance: data.distance,
        elevationGain: data.elevationGain,
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
