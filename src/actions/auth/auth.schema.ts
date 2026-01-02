import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z
    .string()
    .min(6, { message: 'Le mot de passe doit faire au moins 6 caractères' }),
  name: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(1, { message: 'Mot de passe requis' }),
})
