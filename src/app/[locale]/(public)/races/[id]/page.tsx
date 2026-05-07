import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getRaceAction } from '@/actions/race/race.actions'
import { getMyRegistrationAction } from '@/actions/race/registration.actions'
import { auth } from '@/server/modules/auth/auth.config'
import { RaceDetailView } from '@/components/race/RaceDetailView'
import db from '@/server/db'

type PageProps = { params: Promise<{ id: string }> }

export default async function RaceDetailPage({ params }: PageProps) {
  const { id } = await params
  const [race, session] = await Promise.all([getRaceAction(id), auth()])

  if (!race) notFound()

  const myRegistration = session?.user?.id
    ? await getMyRegistrationAction(id)
    : null

  const isOrganizer =
    !!session?.user?.id &&
    (race.organizer.id === session.user.id || session.user.role === 'ADMIN')

  // Gates : vérification email + compte Strava
  let isVerified = false
  if (session?.user?.id) {
    const [userDetails] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { isVerified: true },
      }),
      db.account.findFirst({
        where: { userId: session.user.id, provider: 'strava' },
        select: { providerAccountId: true },
      }),
    ])
    isVerified = userDetails?.isVerified ?? false
  }

  const bannerUrl = race.bannerId ? `/api/files/${race.bannerId}` : null

  return (
    <div>
      {/* Bannière pleine largeur */}
      {bannerUrl && (
        <div className="relative h-56 sm:h-72 w-full overflow-hidden">
          <Image
            src={bannerUrl}
            alt={race.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}

      <div
        className={`max-w-4xl mx-auto px-4 pb-10 ${bannerUrl ? 'pt-10' : 'pt-20'}`}
      >
        <RaceDetailView
          race={race}
          myRegistration={myRegistration}
          isAuthenticated={!!session?.user?.id}
          isOrganizer={isOrganizer}
          isVerified={isVerified}
          hasBanner={!!bannerUrl}
        />
      </div>
    </div>
  )
}
