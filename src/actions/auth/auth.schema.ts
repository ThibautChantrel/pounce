import { z } from 'zod'

const FORBIDDEN_PSEUDO_WORDS = ['admin', 'pounce']

export const GENDER_VALUES = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'] as const
export type GenderValue = (typeof GENDER_VALUES)[number]

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  pseudo: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_\- ]+$/)
    .refine(
      (val) =>
        !FORBIDDEN_PSEUDO_WORDS.some((w) => val.toLowerCase().includes(w))
    ),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationality: z.string().min(1),
  gender: z.enum(GENDER_VALUES),
  birthDate: z.string().min(1),
  height: z.coerce.number().positive().optional().or(z.literal('')),
  weight: z.coerce.number().positive().optional().or(z.literal('')),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
