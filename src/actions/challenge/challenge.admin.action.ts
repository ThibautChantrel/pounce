'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { challengeService } from '@/server/modules/challenge/services/challenge.admin.service'
import { BusinessError, ERROR_CODES } from '@/core/errors'
import { Difficulty } from '@prisma/client'
import {
  CreateChallengeInput,
  UpdateChallengeInput,
} from './challenge.admin.type'

// --- SCHÉMAS ZOD ---

const challengeSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  visible: z.boolean().default(false),
  location: z.string().min(2),
  difficulty: z.nativeEnum(Difficulty),

  coverId: z.string().optional().nullable(),
  bannerId: z.string().optional().nullable(),

  // Tableau d'IDs pour les tracks
  trackIds: z.array(z.string()).optional(),
})

// Schéma update (partiel + id obligatoire)
const updateChallengeSchema = challengeSchema.partial().extend({
  id: z.string(),
})

type ActionResponse = {
  success: boolean
  error?: string
  code?: string
  data?: string
}

// --- ACTIONS ---

export async function createChallengeAction(
  data: CreateChallengeInput
): Promise<ActionResponse> {
  const parsed = challengeSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      code: ERROR_CODES.VALIDATION_ERROR,
    }
  }

  try {
    const res = await challengeService.create(parsed.data)
    revalidatePath('/admin/challenges')
    return { success: true, data: res.id }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    console.error(error)
    throw error
  }
}

export async function updateChallengeAction(
  data: UpdateChallengeInput
): Promise<ActionResponse> {
  const parsed = updateChallengeSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Données invalides',
      code: ERROR_CODES.VALIDATION_ERROR,
    }
  }

  try {
    const res = await challengeService.update(parsed.data)
    revalidatePath('/admin/challenges')
    revalidatePath(`/admin/challenges/${res.id}`)
    return { success: true }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return { success: false, error: error.message, code: error.code }
    }
    console.error(error)
    throw error
  }
}

export async function deleteChallengeAction(
  id: string
): Promise<ActionResponse> {
  try {
    await challengeService.delete(id)
    revalidatePath('/admin/challenges')
    return { success: true }
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error
  }
}

export async function getChallengeAction(id: string) {
  try {
    return await challengeService.get(id)
  } catch (error) {
    throw error
  }
}

export async function fetchChallenges(skip = 0, take = 10, search?: string) {
  return await challengeService.getAllChallenges(skip, take, search)
}
