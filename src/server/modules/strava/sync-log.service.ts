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

export async function createErrorSync(
  userId: string,
  provider: string,
  source: 'webhook' | 'manual',
  activityId: string,
  errorMessage: string
) {
  const errorLog: SyncActivityLog = {
    activityId,
    activityName: null,
    activityType: null,
    distance: null,
    elevationGain: null,
    completedAt: null,
    status: 'error',
    matchedTracks: [],
    errorMessage,
  }
  const details: SyncDetails = {
    activitiesProcessed: 1,
    activitiesMatched: 0,
    activities: [errorLog],
  }
  return db.activitySync.create({
    data: { userId, provider, source, details },
  })
}
