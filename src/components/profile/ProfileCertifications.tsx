import { CertificationGallery } from './CertificationGallery'
import type {
  CompletedChallenge,
  CompletedTrack,
  InProgressChallenge,
} from '@/actions/user/user.certifications.actions'

type Props = {
  completedChallenges: CompletedChallenge[]
  completedTracks: CompletedTrack[]
  inProgressChallenges: InProgressChallenge[]
}

export function ProfileCertifications({
  completedChallenges,
  completedTracks,
  inProgressChallenges,
}: Props) {
  const hasContent =
    completedChallenges.length > 0 ||
    completedTracks.length > 0 ||
    inProgressChallenges.length > 0

  if (!hasContent) return null

  return (
    <CertificationGallery
      completedChallenges={completedChallenges}
      completedTracks={completedTracks}
      inProgressChallenges={inProgressChallenges}
    />
  )
}
