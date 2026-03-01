import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ChallengeHeader } from '@/components/challenge/ChallengeHeader'
import { ChallengeTrackList } from '@/components/challenge/ChallengeTrackList'
import { Info } from 'lucide-react'
import { getChallengeForUserAction } from '@/actions/challenge/challenge.action'
import { MagicSelect } from '@/components/challenge/MagicSelect'
import { getChallengeAction } from '@/actions/challenge/challenge.admin.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

const BASE_URL = process.env.NEXTAUTH_URL || 'https://pounce.app'

export async function generateMetadata({ params }: PageProps) {
  const { id, locale } = await params
  const challenge = await getChallengeAction(id)

  if (!challenge) {
    return { title: 'Challenge non trouvé | Pounce' }
  }

  const imageUrl = challenge.bannerId
    ? `${BASE_URL}/api/files/${challenge.bannerId}`
    : `${BASE_URL}/default-banner.png`

  const totalDistance = challenge.tracks.reduce(
    (acc, t) => acc + t.track.distance,
    0
  )

  const path = `/challenges/${id}`

  return {
    title: `${challenge.title} - Défi Sportif à ${challenge.location} | Pounce`,
    description: `${challenge.tracks.length} étapes, ${totalDistance}km. ${challenge.description?.slice(0, 150) || 'Relevez le défi !'}`,
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: {
        fr: `${BASE_URL}/fr${path}`,
        en: `${BASE_URL}/en${path}`,
      },
    },
    openGraph: {
      title: `${challenge.title} - Pounce`,
      description: `Relève ce challenge de ${totalDistance}km à ${challenge.location}.`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Bannière du challenge ${challenge.title}`,
        },
      ],
    },
  }
}

export default async function ChallengeDetailPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Challenges.ChallengeDetail')

  const challenge = await getChallengeForUserAction(params.id)

  if (!challenge) {
    notFound()
  }

  const totalDistance = challenge.tracks.reduce(
    (acc, t) => acc + t.track.distance,
    0
  )
  const totalElevation = challenge.tracks.reduce(
    (acc, t) => acc + (t.track.elevationGain || 0),
    0
  )

  return (
    <main className="min-h-screen dark:bg-black pb-20">
      <ChallengeHeader
        title={challenge.title}
        location={challenge.location}
        difficulty={challenge.difficulty}
        banner={challenge.banner}
        cover={challenge.cover}
        totalDistance={totalDistance}
        totalElevation={totalElevation}
        tracksCount={challenge.tracks.length}
        createdAt={challenge.createdAt}
      />

      <div className="container max-w-5xl mx-auto px-4">
        <div className="mb-12 mt-8">
          <div className="flex items-center gap-2 text-primary font-bold text-lg border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
            <Info className="w-5 h-5" />
            <h2>{t('statsTitle')}</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap leading-relaxed text-base text-justify">
              {challenge.description || t('noDescription')}
            </p>
          </div>
        </div>

        <MagicSelect tracks={challenge.tracks} />

        <ChallengeTrackList tracks={challenge.tracks} />
      </div>
    </main>
  )
}
