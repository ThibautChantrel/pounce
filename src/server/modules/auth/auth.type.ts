// types/next-auth.d.ts
import { Role } from '@prisma/client'
import { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role?: Role
  }

  // 2. On étend le type "Session" (celui utilisé dans useSession / auth())
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }
}

// 3. On étend le type "JWT" (le token chiffré)
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}
