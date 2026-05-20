'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { raceService } from '@/server/modules/race/race.service'
import {
  raceAdminService,
  AdminUpdateRaceInput,
} from '@/server/modules/race/race.admin.service'
import { RegistrationStatus, RaceStatus } from '@prisma/client'
import { CreateRaceInput } from './race.types'
import { setRegistrationResult } from '@/server/modules/race/race-certification.service'
import {
  onRaceStarted,
  onRaceClosed,
} from '@/server/modules/race/race-lifecycle.service'
import db from '@/server/db'

type ActionResponse = { success: boolean; error?: string; id?: string }

async function getAdminSession() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN')
    throw new Error('unauthorized')
  return session
}

export async function adminListRacesAction(params: {
  skip?: number
  take?: number
  search?: string
  status?: RaceStatus
}) {
  await getAdminSession()
  return raceService.listForAdmin(params)
}

export async function adminValidateRaceAction(
  id: string
): Promise<ActionResponse> {
  try {
    const session = await getAdminSession()
    await raceService.adminValidate(id, session.user.id)
    revalidatePath('/admin/races')
    revalidatePath(`/admin/races/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: 'internal_error' }
  }
}

export async function adminRejectRaceAction(
  id: string,
  reason: string
): Promise<ActionResponse> {
  if (!reason?.trim()) return { success: false, error: 'reason_required' }
  try {
    const session = await getAdminSession()
    await raceService.adminReject(id, session.user.id, reason)
    revalidatePath('/admin/races')
    revalidatePath(`/admin/races/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: 'internal_error' }
  }
}

export async function adminCreateRaceAction(
  data: CreateRaceInput & { organizerId: string }
): Promise<ActionResponse> {
  try {
    const session = await getAdminSession()
    const result = await raceAdminService.createRace(data, session.user.id)
    revalidatePath('/admin/races')
    revalidatePath('/races')
    return { success: true, id: result.id }
  } catch (err) {
    console.error('[adminCreateRace]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function adminUpdateRaceAction(
  data: AdminUpdateRaceInput
): Promise<ActionResponse> {
  try {
    await getAdminSession()
    await raceAdminService.updateRace(data)

    if (data.status === RaceStatus.IN_PROGRESS) await onRaceStarted(data.id)
    if (data.status === RaceStatus.CLOSED) await onRaceClosed(data.id)

    revalidatePath('/admin/races')
    revalidatePath(`/admin/races/${data.id}`)
    revalidatePath(`/races/${data.id}`)
    return { success: true }
  } catch (err) {
    console.error('[adminUpdateRace]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function adminSearchUsersAction(query: string) {
  await getAdminSession()
  return raceAdminService.searchUsers(query)
}

export async function adminUpdateRegistrationAction(
  registrationId: string,
  data: {
    status?: RegistrationStatus
    statusReason?: string | null
    rank?: number | null
    totalTimeSeconds?: number | null
    validatedAt?: Date | null
    finishedAt?: Date | null
    avgSpeed?: number | null
    maxSpeed?: number | null
    heartRateAvg?: number | null
    heartRateMax?: number | null
    calories?: number | null
  }
): Promise<ActionResponse> {
  try {
    const session = await getAdminSession()
    const shouldSetOneShotResult =
      data.status === RegistrationStatus.VALIDATED &&
      typeof data.rank === 'number' &&
      typeof data.totalTimeSeconds === 'number'

    if (shouldSetOneShotResult) {
      await setRegistrationResult(
        registrationId,
        data.rank!,
        data.totalTimeSeconds!,
        session.user.id,
        {
          avgSpeed: data.avgSpeed ?? null,
          maxSpeed: data.maxSpeed ?? null,
          heartRateAvg: data.heartRateAvg ?? null,
          heartRateMax: data.heartRateMax ?? null,
          calories: data.calories ?? null,
          finishedAt: data.finishedAt ?? data.validatedAt ?? null,
        }
      )
    } else {
      await raceAdminService.updateRegistration(registrationId, {
        status: data.status,
        statusReason: data.statusReason,
        rank: data.rank,
        totalTimeSeconds: data.totalTimeSeconds,
        validatedAt: data.validatedAt,
        finishedAt: data.finishedAt,
        statusUpdatedBy: session.user.id,
        ...(data.status === RegistrationStatus.VALIDATED && !data.validatedAt
          ? { validatedAt: new Date() }
          : {}),
      })
    }

    const reg = await db.raceRegistration.findUnique({
      where: { id: registrationId },
      select: { raceId: true },
    })
    revalidatePath('/admin/races')
    if (reg?.raceId) revalidatePath(`/admin/races/${reg.raceId}`)
    return { success: true }
  } catch (err) {
    console.error('[adminUpdateRegistration]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function adminDeleteRegistrationAction(
  registrationId: string
): Promise<ActionResponse> {
  try {
    await getAdminSession()
    await raceAdminService.deleteRegistration(registrationId)
    revalidatePath('/admin/races')
    return { success: true }
  } catch (err) {
    console.error('[adminDeleteRegistration]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function adminCreateRegistrationAction(
  raceId: string,
  userId: string
): Promise<ActionResponse> {
  try {
    await getAdminSession()
    await raceAdminService.createRegistration(raceId, userId)
    revalidatePath('/admin/races')
    revalidatePath(`/admin/races/${raceId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'internal_error'
    if (
      msg === 'race_not_found' ||
      msg === 'race_full' ||
      msg === 'P2002' ||
      msg === 'already_registered'
    ) {
      return { success: false, error: msg }
    }
    console.error('[adminCreateRegistration]', err)
    return { success: false, error: 'internal_error' }
  }
}
