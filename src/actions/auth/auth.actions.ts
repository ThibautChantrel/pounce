'use server'

import { BusinessError, ERROR_CODES } from '@/core/errors' // <--- Import
import { registerUser } from '@/server/modules/user/service/user.service'
import { LoginSchema, RegisterSchema } from './auth.schema'
import { signIn, signOut } from '@/server/modules/auth/auth.config'

export interface AuthActionState {
  success: boolean
  error?: string
  code?: string
}
export async function registerAction(
  prevState: AuthActionState,
  formData: FormData
) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
  }

  const validated = RegisterSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    await registerUser(validated.data)
    const res = await signIn('credentials', {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    })
    if (!res || res.error) {
      return {
        success: false,
        error: "Échec de la connexion après l'inscription.",
        code: 'LOGIN_AFTER_REGISTER_FAILED',
      }
    }
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

export async function loginAction(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validated = LoginSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
      code: 'VALIDATION_ERROR',
    }
  }

  const { email, password } = validated.data

  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!res || res.error) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS',
      }
    }

    return { success: true }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
      code: 'INTERNAL_ERROR',
    }
  }
}

export async function logoutAction() {
  await signOut({ redirect: false })
  return { success: true }
}
