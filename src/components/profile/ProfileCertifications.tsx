import { CertificationGallery } from './CertificationGallery'
import type {
  CompletedChallenge,
  CompletedTrack,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'
import type { listMyParticipationsAction } from '@/actions/race/registration.actions'

type Props = {
  completedChallenges: CompletedChallenge[]
  completedTracks: CompletedTrack[]
  inProgressChallenges: InProgressChallenge[]
  participations: Awaited<ReturnType<typeof listMyParticipationsAction>>
}

export function ProfileCertifications({
  completedChallenges,
  completedTracks,
  inProgressChallenges,
  participations,
}: Props) {
  const hasContent =
    completedChallenges.length > 0 ||
    completedTracks.length > 0 ||
    inProgressChallenges.length > 0 ||
    participations.length > 0

  if (!hasContent) return null

  return (
    <CertificationGallery
      completedChallenges={completedChallenges}
      completedTracks={completedTracks}
      inProgressChallenges={inProgressChallenges}
      participations={participations}
    />
  )
}
