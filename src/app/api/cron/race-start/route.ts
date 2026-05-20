import { NextRequest, NextResponse } from 'next/server'
import { startRacesDue } from '@/server/modules/race/race-lifecycle.service'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { started } = await startRacesDue()

  console.log(`[cron/race-start] ${started} race(s) set to IN_PROGRESS`)

  return NextResponse.json({ started })
}
