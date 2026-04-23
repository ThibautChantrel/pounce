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
  stravaActivityId: string
  activityName: string | null
  status: SyncActivityStatus
  matchedTracks: SyncMatchedTrack[]
  errorMessage: string | null
}

export type SyncDetails = {
  activitiesProcessed: number
  activitiesMatched: number
  activities: SyncActivityLog[]
}
