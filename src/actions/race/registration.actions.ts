'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { registrationService } from '@/server/modules/race/registration.service'
import {
  LoopStatus,
  Role,
  RegistrationStatus,
  ValidationSource,
} from '@prisma/client'
import { setRegistrationResult } from '@/server/modules/race/race-certification.service'
import { recalculateBackyardRanks } from '@/server/modules/race/race-result.service'
import db from '@/server/db'

type ActionResponse = { success: boolean; error?: string }

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('unauthorized')
  return session
}

export async function registerForRaceAction(
  raceId: string,
  accessCode?: string
): Promise<ActionResponse> {
  try {
    const session = await getSession()
    await registrationService.register(raceId, session.user.id, accessCode)
    revalidatePath(`/races/${raceId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'internal_error'
    return { success: false, error: msg }
  }
}

export async function cancelRegistrationAction(
  raceId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession()
    await registrationService.cancelRegistration(raceId, session.user.id)
    revalidatePath(`/races/${raceId}`)
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'internal_error'
    return { success: false, error: msg }
  }
}

export async function validateRegistrationAction(
  registrationId: string
): Promise<ActionResponse> {
  try {
    const session = await getSession()
    await registrationService.validateRegistration(
      registrationId,
      session.user.id,
      session.user.role
    )
    revalidatePath('/profile/races')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'internal_error'
    return { success: false, error: msg }
  }
}

export async function updateRegistrationStatusAction(
  registrationId: string,
  status: RegistrationStatus,
  reason?: string
): Promise<ActionResponse> {
  try {
    const session = await getSession()
    await registrationService.updateStatus(
      registrationId,
      status,
      reason,
      session.user.id,
      session.user.role
    )
    revalidatePath('/profile/races')
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'internal_error'
    return { success: false, error: msg }
  }
}

export async function setRaceResultAction(
  registrationId: string,
  rank: number,
  totalTimeSeconds: number,
  details?: {
    avgSpeed?: number | null
    maxSpeed?: number | null
    heartRateAvg?: number | null
    heartRateMax?: number | null
    calories?: number | null
    finishedAt?: Date | null
  }
): Promise<ActionResponse & { certifiedChallengeIds?: string[] }> {
  try {
    const session = await getSession()

    const reg = await db.raceRegistration.findUnique({
      where: { id: registrationId },
      select: { race: { select: { organizerId: true } } },
    })
    if (!reg) return { success: false, error: 'not_found' }
    if (
      reg.race.organizerId !== session.user.id &&
      session.user.role !== Role.ADMIN
    ) {
      return { success: false, error: 'unauthorized' }
    }

    const result = await setRegistrationResult(
      registrationId,
      rank,
      totalTimeSeconds,
      session.user.id,
      details
    )

    revalidatePath('/profile/races')
    return {
      success: true,
      certifiedChallengeIds: result.certifiedChallengeIds,
    }
  } catch (err) {
    console.error('[setRaceResult]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function addBackyardLoopAction(
  registrationId: string,
  timeSeconds: number,
  details?: {
    avgSpeed?: number | null
    heartRateAvg?: number | null
    heartRateMax?: number | null
    startedAt?: Date | null
    completedAt?: Date | null
  }
): Promise<ActionResponse> {
  try {
    const session = await getSession()

    const reg = await db.raceRegistration.findUnique({
      where: { id: registrationId },
      select: {
        raceId: true,
        race: { select: { organizerId: true } },
        backyardLoops: {
          where: { status: LoopStatus.VALIDATED },
          orderBy: { loopNumber: 'desc' },
          take: 1,
          select: { loopNumber: true },
        },
      },
    })
    if (!reg) return { success: false, error: 'not_found' }
    if (
      reg.race.organizerId !== session.user.id &&
      session.user.role !== Role.ADMIN
    ) {
      return { success: false, error: 'unauthorized' }
    }

    const nextLoopNumber = (reg.backyardLoops[0]?.loopNumber ?? 0) + 1

    await db.backyardLoop.create({
      data: {
        registrationId,
        loopNumber: nextLoopNumber,
        timeSeconds,
        avgSpeed: details?.avgSpeed ?? null,
        heartRateAvg: details?.heartRateAvg ?? null,
        heartRateMax: details?.heartRateMax ?? null,
        startedAt: details?.startedAt ?? null,
        completedAt: details?.completedAt ?? null,
        status: LoopStatus.VALIDATED,
        validationSource: ValidationSource.ORGANIZER,
        validatedAt: new Date(),
      },
    })

    await recalculateBackyardRanks(reg.raceId)
    revalidatePath('/profile/races')
    return { success: true }
  } catch (err) {
    console.error('[addBackyardLoop]', err)
    return { success: false, error: 'internal_error' }
  }
}

export async function getMyRegistrationAction(raceId: string) {
  try {
    const session = await getSession()
    return registrationService.getUserRegistration(raceId, session.user.id)
  } catch {
    return null
  }
}

export async function listMyParticipationsAction() {
  try {
    const session = await getSession()
    return registrationService.listForUser(session.user.id)
  } catch {
    return []
  }
}
