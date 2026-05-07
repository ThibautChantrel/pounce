import { NextRequest, NextResponse } from 'next/server'
import db from '@/server/db'
import { RaceStatus } from '@prisma/client'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const result = await db.race.updateMany({
    where: {
      status: RaceStatus.ACTIVE,
      startAt: { lte: now },
      endAt: { gt: now },
    },
    data: { status: RaceStatus.IN_PROGRESS },
  })

  console.log(`[cron/race-start] ${result.count} race(s) set to IN_PROGRESS`)

  return NextResponse.json({ started: result.count })
}
