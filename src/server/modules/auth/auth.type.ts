import { Role } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: Role
  }

  interface Session {
    user: {
      id: string
      role: Role
      pseudo?: string | null
      firstName?: string | null
      lastName?: string | null
    } & DefaultSession['user']
  }
}
