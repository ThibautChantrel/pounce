'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/modules/auth/auth.config'
import { raceService } from '@/server/modules/race/race.service'
import { RaceStatus } from '@prisma/client'

type ActionResponse = { success: boolean; error?: string }

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
