'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { registrationService } from '@/server/modules/race/registration.service'
import { RegistrationStatus } from '@prisma/client'

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

export async function getMyRegistrationAction(raceId: string) {
  try {
    const session = await getSession()
    return registrationService.getUserRegistration(raceId, session.user.id)
  } catch {
    return null
  }
}
