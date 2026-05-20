export type SyncMatchedTrack = {
  trackId: string
  trackTitle: string
  matchedPoints: number
  totalPoints: number
  direction: 'forward' | 'backward'
}

export type SyncActivityStatus =
  | 'matched'
  | 'no_match'
  | 'no_polyline'
  | 'skipped'
  | 'error'

export type SyncActivityLog = {
  activityId: string
  activityName: string | null
  activityType: string | null
  distance: number | null
  elevationGain: number | null
  completedAt: string | null
  status: SyncActivityStatus
  matchedTracks: SyncMatchedTrack[]
  errorMessage: string | null
}

export type SyncDetails = {
  activitiesProcessed: number
  activitiesMatched: number
  activities: SyncActivityLog[]
}
