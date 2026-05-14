import {
  ActivityMode,
  LoopStatus,
  RaceAccessType,
  RaceFormat,
  RaceStatus,
  RegistrationStatus,
  ValidationSource,
} from '@prisma/client'

export type RaceSummary = {
  id: string
  title: string
  description: string | null
  activityMode: ActivityMode
  format: RaceFormat
  accessType: RaceAccessType
  status: RaceStatus
  startAt: Date
  endAt: Date
  maxParticipants: number | null
  loopDurationMinutes: number | null
  registrationCount: number
  organizer: {
    id: string
    firstName: string | null
    lastName: string | null
    pseudo: string | null
  }
  track: {
    id: string
    title: string
    distance: number
    elevationGain: number
    coverId: string | null
    gpxFileId: string | null
  }
  logoId: string | null
  bannerId: string | null
  adminValidatedAt: Date | null
  adminRejectionReason: string | null
  adminValidatedBy: {
    id: string
    firstName: string | null
    lastName: string | null
  } | null
  createdAt: Date
}

export type RaceDetail = RaceSummary & {
  accessCode: string | null
  registrations: RegistrationSummary[]
}

export type RegistrationSummary = {
  id: string
  userId: string
  status: RegistrationStatus
  registeredAt: Date
  validatedAt: Date | null
  totalTimeSeconds: number | null
  rank: number | null
  validationSource: ValidationSource | null
  stravaActivityId: string | null
  statusReason: string | null
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    pseudo: string | null
    email: string
  }
  backyardLoops: BackyardLoopSummary[]
}

export type BackyardLoopSummary = {
  id: string
  loopNumber: number
  status: LoopStatus
  timeSeconds: number | null
  avgSpeed: number | null
  heartRateAvg: number | null
  heartRateMax: number | null
  completedAt: Date | null
  validationSource: ValidationSource | null
}

export type CreateRaceInput = {
  title: string
  description?: string | null
  activityMode: ActivityMode
  format: RaceFormat
  accessType: RaceAccessType
  accessCode?: string | null
  maxParticipants?: number | null
  startAt: Date
  endAt: Date
  loopDurationMinutes?: number | null
  trackId: string
  logoId?: string | null
  bannerId?: string | null
}

export type UpdateRaceInput = Partial<CreateRaceInput> & { id: string }
