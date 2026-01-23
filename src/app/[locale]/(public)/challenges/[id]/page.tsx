import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getChallengeAction } from '@/actions/challenge/challenge.admin.action'
import { ChallengeHeader } from '@/components/challenge/ChallengeHeader'
import { ChallengeStats } from '@/components/challenge/ChallengeStats'
import { ChallengeTrackList } from '@/components/challenge/ChallengeTrackList'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function ChallengeDetailPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Challenges.ChallengeDetail')

  // 1. Récupération de la donnée
  const challenge = await getChallengeAction(params.id)

  if (!challenge) {
    notFound()
  }

  // 2. Calcul des statistiques globales
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
      {/* 1. Header (Banner + Cover + Title) */}
      <ChallengeHeader
        title={challenge.title}
        location={challenge.location}
        difficulty={challenge.difficulty}
        banner={challenge.banner}
        cover={challenge.cover}
      />

      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 2. Colonne Gauche : Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap leading-relaxed text-lg">
                {challenge.description || t('noDescription')}
              </p>
            </div>
          </div>

          {/* 3. Colonne Droite : Stats */}
          <div className="lg:col-span-1">
            <ChallengeStats
              totalDistance={totalDistance}
              totalElevation={totalElevation}
              tracksCount={challenge.tracks.length}
              createdAt={challenge.createdAt}
            />
          </div>
        </div>

        {/* 4. Liste des parcours */}
        <ChallengeTrackList tracks={challenge.tracks} />
      </div>
    </main>
  )
}
