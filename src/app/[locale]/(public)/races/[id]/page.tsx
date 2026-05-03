import { notFound } from 'next/navigation'
import { getRaceAction } from '@/actions/race/race.actions'
import { getMyRegistrationAction } from '@/actions/race/registration.actions'
import { auth } from '@/server/modules/auth/auth.config'
import { RaceDetailView } from '@/components/race/RaceDetailView'

type PageProps = { params: Promise<{ id: string }> }

export default async function RaceDetailPage({ params }: PageProps) {
  const { id } = await params
  const [race, session] = await Promise.all([getRaceAction(id), auth()])

  if (!race) notFound()

  const myRegistration = session?.user?.id
    ? await getMyRegistrationAction(id)
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <RaceDetailView
        race={race}
        myRegistration={myRegistration}
        isAuthenticated={!!session?.user?.id}
      />
    </div>
  )
}
