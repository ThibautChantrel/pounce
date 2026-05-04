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

  // Only active backyard races
  const races = await db.race.findMany({
    where: {
      status: RaceStatus.ACTIVE,
      format: RaceFormat.BACKYARD,
      loopDurationMinutes: { not: null },
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
          userId: true,
          backyardLoops: {
            where: { status: LoopStatus.PENDING },
            select: { id: true, loopNumber: true, startedAt: true },
          },
        },
      },
    },
  })

  let totalMissed = 0
  let totalDNF = 0

  for (const race of races) {
    const loopDurationMs = (race.loopDurationMinutes ?? 0) * 60 * 1000

    for (const reg of race.registrations) {
      for (const loop of reg.backyardLoops) {
        // Compute loop start: explicit startedAt OR race.startAt + (loopNumber-1) * loopDuration
        const loopStart =
          loop.startedAt ??
          new Date(
            race.startAt.getTime() + (loop.loopNumber - 1) * loopDurationMs
          )

        const deadline = new Date(loopStart.getTime() + loopDurationMs)

        if (deadline <= now) {
          await db.backyardLoop.update({
            where: { id: loop.id },
            data: {
              status: LoopStatus.MISSED,
              validationSource: ValidationSource.AUTO,
              validatedAt: now,
            },
          })
          totalMissed++

          // Mark registration as DNF
          await db.raceRegistration.update({
            where: { id: reg.id },
            data: {
              status: RegistrationStatus.DNF,
              statusReason: `Loop ${loop.loopNumber} non complété dans les temps`,
              statusUpdatedBy: 'system',
            },
          })
          totalDNF++
        }
      }
    }
  }

  console.log(
    `[cron/backyard-dnf] ${totalMissed} loop(s) missed, ${totalDNF} DNF(s) recorded`
  )

  return NextResponse.json({ missed: totalMissed, dnf: totalDNF })
}
