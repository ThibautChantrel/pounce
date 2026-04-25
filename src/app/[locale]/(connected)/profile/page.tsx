import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { getOne } from '@/server/modules/user/repositories/user.repository'
import { getStravaStatusAction } from '@/actions/strava/strava.actions'
import {
  fetchUnreadCertifications,
  fetchUserProfileStats,
  fetchUserUnmatchedActivities,
} from '@/actions/user/user.certifications.actions'
import { ProfileCertifications } from '@/components/profile/ProfileCertifications'
import { UserUnmatchedActivities } from '@/components/profile/UserUnmatchedActivities'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const [user, stravaStatus, profileStats, unmatchedActivities, unreadCerts] =
    await Promise.all([
      getOne(session.user.id),
      getStravaStatusAction(),
      fetchUserProfileStats(),
      fetchUserUnmatchedActivities(),
      fetchUnreadCertifications(),
    ])

  if (!user) notFound()

  return (
    <ProfileClient
      user={user}
      stravaStatus={stravaStatus}
      initialUnreadCertifications={unreadCerts}
    >
      <ProfileCertifications
        completedChallenges={profileStats.completedChallenges}
        completedTracks={profileStats.completedTracks}
        inProgressChallenges={profileStats.inProgressChallenges}
      />
      <UserUnmatchedActivities activities={unmatchedActivities} />
    </ProfileClient>
  )
}
