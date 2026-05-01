'use server'

import db from '@/server/db'

export async function checkPseudoAvailability(
  pseudo: string
): Promise<{ available: boolean }> {
  if (!pseudo || pseudo.length < 3) return { available: false }

  const forbidden = ['admin', 'pounce']
  if (forbidden.some((w) => pseudo.toLowerCase().includes(w))) {
    return { available: false }
  }

  const existing = await db.user.findUnique({ where: { pseudo } })
  return { available: !existing }
}
