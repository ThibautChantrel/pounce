'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { registrationService } from '@/server/modules/race/registration.service'
import { Role, RegistrationStatus } from '@prisma/client'
import { setRegistrationResult } from '@/server/modules/race/race-certification.service'
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
  totalTimeSeconds: number
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
      session.user.id
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

export async function getMyRegistrationAction(raceId: string) {
  try {
    const session = await getSession()
    return registrationService.getUserRegistration(raceId, session.user.id)
  } catch {
    return null
  }
}
