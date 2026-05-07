import { NextRequest, NextResponse } from 'next/server'
import db from '@/server/db'
import {
  LoopStatus,
  RaceFormat,
  RaceStatus,
  RegistrationStatus,
  ValidationSource,
} from '@prisma/client'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const races = await db.race.findMany({
    where: {
      status: RaceStatus.ACTIVE,
      format: RaceFormat.BACKYARD,
      loopDurationMinutes: { not: null },
      startAt: { lte: now },
    },
    select: {
      id: true,
      startAt: true,
      loopDurationMinutes: true,
      registrations: {
        where: {
          status: {
            in: [RegistrationStatus.REGISTERED, RegistrationStatus.VALIDATED],
          },
        },
        select: {
          id: true,
          // Dernière boucle validée pour déterminer la prochaine attendue
          backyardLoops: {
            where: { status: LoopStatus.VALIDATED },
            orderBy: { loopNumber: 'desc' },
            take: 1,
            select: { loopNumber: true },
          },
        },
      },
    },
  })

  let totalMissed = 0
  let totalDNF = 0

  for (const race of races) {
    const loopDurationMs = race.loopDurationMinutes! * 60 * 1000

    for (const reg of race.registrations) {
      // La prochaine boucle attendue = dernière boucle validée + 1 (ou 1 si aucune)
      const lastValidatedLoop = reg.backyardLoops[0]?.loopNumber ?? 0
      const nextLoopNumber = lastValidatedLoop + 1
      const deadline = new Date(
        race.startAt.getTime() + nextLoopNumber * loopDurationMs
      )

      // La deadline n'est pas encore passée → rien à faire
      if (deadline > now) continue

      // Vérifier si cette boucle est déjà enregistrée (VALIDATED ou MISSED)
      const existingLoop = await db.backyardLoop.findUnique({
        where: {
          registrationId_loopNumber: {
            registrationId: reg.id,
            loopNumber: nextLoopNumber,
          },
        },
      })
      if (existingLoop) continue

      // La deadline est passée sans aucune boucle validée → DNF
      await db.backyardLoop.create({
        data: {
          registrationId: reg.id,
          loopNumber: nextLoopNumber,
          status: LoopStatus.MISSED,
          validationSource: ValidationSource.AUTO,
          validatedAt: now,
        },
      })
      totalMissed++

      await db.raceRegistration.update({
        where: { id: reg.id },
        data: {
          status: RegistrationStatus.DNF,
          statusReason: `Boucle ${nextLoopNumber} non complétée dans les temps`,
          statusUpdatedBy: 'system',
        },
      })
      totalDNF++
    }
  }

  console.log(
    `[cron/backyard-dnf] ${totalMissed} loop(s) missed, ${totalDNF} DNF(s) recorded`
  )

  return NextResponse.json({ missed: totalMissed, dnf: totalDNF })
}
