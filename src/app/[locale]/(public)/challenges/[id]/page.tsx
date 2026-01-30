import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ChallengeHeader } from '@/components/challenge/ChallengeHeader'
import { ChallengeTrackList } from '@/components/challenge/ChallengeTrackList'
import { Info } from 'lucide-react'
import { getChallengeForUserAction } from '@/actions/challenge/challenge.action'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
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
    <main className="min-h-screen bg-zinc-50 dark:bg-black pb-20">
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
          <div className="flex items-center gap-2 text-canopy font-bold text-lg border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
            <Info className="w-5 h-5" />
            <h2>{t('statsTitle')}</h2>
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground">
            <p className="whitespace-pre-wrap leading-relaxed text-base text-justify">
              {challenge.description || t('noDescription')}
            </p>
          </div>
        </div>

        <ChallengeTrackList tracks={challenge.tracks} />
      </div>
    </main>
  )
}
