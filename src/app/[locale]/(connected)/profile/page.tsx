import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { getOne } from '@/server/modules/user/repositories/user.repository'
import { getStravaStatusAction } from '@/actions/strava/strava.actions'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const [user, stravaStatus] = await Promise.all([
    getOne(session.user.id),
    getStravaStatusAction(),
  ])

  if (!user) notFound()

  return <ProfileClient user={user} stravaStatus={stravaStatus} />
}
