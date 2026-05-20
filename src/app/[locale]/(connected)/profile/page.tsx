import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { getOne } from '@/server/modules/user/repositories/user.repository'
import { getStravaStatusAction } from '@/actions/strava/strava.actions'
import {
  fetchUnreadCertifications,
  fetchUserProfileStats,
  fetchUserUnmatchedActivities,
} from '@/actions/user/user.certifications.actions'
import { listMyParticipationsAction } from '@/actions/race/registration.actions'
import { listMyRacesAction } from '@/actions/race/race.actions'
import { ProfileCertifications } from '@/components/profile/ProfileCertifications'
import { UserUnmatchedActivities } from '@/components/profile/UserUnmatchedActivities'
import { RaceManagementTable } from '@/components/profile/RaceManagementTable'
import ProfileClient from './ProfileClient'

const VALID_TABS = ['stats', 'organisateur', 'historique'] as const
type TabId = (typeof VALID_TABS)[number]

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const rawParams = await searchParams
  const tabParam = typeof rawParams.tab === 'string' ? rawParams.tab : 'stats'
  const activeTab: TabId = VALID_TABS.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : 'stats'
  const showAll = rawParams.showAll === '1'

  const [user, stravaStatus, unreadCerts] = await Promise.all([
    getOne(session.user.id),
    getStravaStatusAction(),
    fetchUnreadCertifications(),
  ])

  if (!user) notFound()

  let tabContent: React.ReactNode = null

  if (activeTab === 'stats') {
    const [profileStats, participations] = await Promise.all([
      fetchUserProfileStats(),
      listMyParticipationsAction(),
    ])
    tabContent = (
      <ProfileCertifications
        completedChallenges={profileStats.completedChallenges}
        completedTracks={profileStats.completedTracks}
        inProgressChallenges={profileStats.inProgressChallenges}
        participations={participations}
      />
    )
  } else if (activeTab === 'organisateur') {
    const myRaces = await listMyRacesAction()
    tabContent = <RaceManagementTable races={myRaces} />
  } else if (activeTab === 'historique') {
    const unmatchedActivities = await fetchUserUnmatchedActivities()
    tabContent = (
      <UserUnmatchedActivities
        activities={unmatchedActivities}
        showAll={showAll}
      />
    )
  }

  return (
    <ProfileClient
      user={user}
      stravaStatus={stravaStatus}
      initialUnreadCertifications={unreadCerts}
      activeTab={activeTab}
    >
      {tabContent}
    </ProfileClient>
  )
}
