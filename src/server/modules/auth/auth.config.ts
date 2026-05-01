import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import db from '@/server/db'
import { LoginSchema } from '@/actions/auth/auth.schema'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      authorize: async (credentials) => {
        const validated = LoginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, password } = validated.data

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            emailVerified: true,
            pseudo: true,
            firstName: true,
            lastName: true,
          },
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          pseudo: user.pseudo,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any
        if (u.role) token.role = u.role
        token.pseudo = u.pseudo ?? null
        token.firstName = u.firstName ?? null
        token.lastName = u.lastName ?? null
      }
      return token
    },

    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = token as any
      if (session.user) {
        session.user.id = t.id as string
        session.user.role = t.role
        session.user.pseudo = t.pseudo ?? null
        session.user.firstName = t.firstName ?? null
        session.user.lastName = t.lastName ?? null
      }
      return session
    },
  },
})
