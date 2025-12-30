'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors' // <--- Import
import { registerUser } from '@/server/modules/user/service/user.service'
import { RegisterSchema } from './auth.schema'

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerAction(prevState: any, formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  }

  const validated = RegisterSchema.safeParse(rawData)

  // 1. Gestion des erreurs de validation (Zod)
  if (!validated.success) {
    return {
      success: false,
      // On peut aussi typer ça plus tard, pour l'instant on renvoie le message Zod
      error: validated.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    await registerUser(validated.data)
    return { success: true }

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // 2. Gestion des erreurs métier
    if (e instanceof BusinessError) {
      console.log('Erreur Métier :', e.code)
      return {
        success: false,
        error: e.message,
        code: e.code,
      }
    }

    // 3. Gestion des erreurs techniques (Crash DB, etc.)
    console.error('Erreur Critique :', e)
    return {
      success: false,
      error: 'Une erreur inattendue est survenue.',
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    }
  }
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loginAction(prevState: any, formData: FormData) {
  // On simulera juste une erreur pour l'instant ou rien du tout
  console.log('Login submitted (Not implemented yet)')
  return {
    success: false,
    error: 'Fonctionnalité en cours de développement',
    code: 'TODO',
  }
}
