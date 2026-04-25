import db from '@/server/db'
import { SyncActivityLog, SyncDetails } from './sync-log.types'

export async function createActivitySync(
  userId: string,
  provider: string,
  source: 'webhook' | 'manual',
  activities: SyncActivityLog[]
) {
  const details: SyncDetails = {
    activitiesProcessed: activities.length,
    activitiesMatched: activities.filter((a) => a.status === 'matched').length,
    activities,
  }

  return db.activitySync.create({
    data: { userId, provider, source, details },
  })
}
