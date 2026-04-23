import db from '@/server/db'
import { SyncActivityLog, SyncDetails } from './sync-log.types'

export async function createStravaSync(
  userId: string,
  source: 'webhook' | 'manual',
  activities: SyncActivityLog[]
) {
  const details: SyncDetails = {
    activitiesProcessed: activities.length,
    activitiesMatched: activities.filter((a) => a.status === 'matched').length,
    activities,
  }

  return db.stravaSync.create({
    data: { userId, source, details },
  })
}
