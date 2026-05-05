'use client'

import { RaceFormat, RegistrationStatus } from '@prisma/client'
import type { RaceDetail } from '@/actions/race/race.types'
import { RaceStatsCards } from './RaceStatsCards'
import { RaceCompletionPie } from './RaceCompletionPie'
import { BackyardSurvivalChart } from './BackyardSurvivalChart'
import { BackyardLoopTimesChart } from './BackyardLoopTimesChart'
import { BackyardAvgLoopChart } from './BackyardAvgLoopChart'
import { OneShotSpeedChart } from './OneShotSpeedChart'

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

type Props = { race: RaceDetail }

export function RaceStatsSection({ race }: Props) {
  const { registrations, format, track } = race
  const isOneShot = format === RaceFormat.ONE_SHOT
  const isBackyard = format === RaceFormat.BACKYARD

  const hasResults = isOneShot
    ? registrations.some(
        (r) => r.status === RegistrationStatus.VALIDATED && r.totalTimeSeconds
      )
    : registrations.some((r) =>
        r.backyardLoops.some((l) => l.status === 'VALIDATED')
      )

  if (registrations.length === 0) return null

  const hasAnyBpm = registrations
    .flatMap((r) => r.backyardLoops)
    .some((l) => l.heartRateAvg)

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <RaceStatsCards race={race} />

      {isOneShot && hasResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Répartition des statuts */}
          <ChartCard title="Répartition des participants">
            <RaceCompletionPie registrations={registrations} />
          </ChartCard>

          {/* Vitesse par participant */}
          <ChartCard title="Vitesse moyenne (km/h)">
            <OneShotSpeedChart
              registrations={registrations}
              trackDistance={track.distance}
            />
          </ChartCard>
        </div>
      )}

      {isOneShot && !hasResults && registrations.length > 0 && (
        <ChartCard title="Répartition des participants">
          <RaceCompletionPie registrations={registrations} />
        </ChartCard>
      )}

      {isBackyard && hasResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Courbe de survie */}
            <ChartCard title="Courbe de survie — participants par boucle">
              <BackyardSurvivalChart registrations={registrations} />
            </ChartCard>

            {/* Temps moyen par boucle */}
            <ChartCard title="Temps moyen par boucle">
              <BackyardAvgLoopChart registrations={registrations} />
            </ChartCard>
          </div>

          {/* Évolution des temps par participant */}
          <ChartCard title="Temps par boucle — évolution par participant">
            <BackyardLoopTimesChart registrations={registrations} mode="time" />
          </ChartCard>

          {/* Vitesse par boucle */}
          <ChartCard title="Vitesse par boucle (km/h) — évolution par participant">
            <BackyardLoopTimesChart
              registrations={registrations}
              mode="speed"
            />
          </ChartCard>

          {/* BPM par boucle */}
          {hasAnyBpm && (
            <ChartCard title="Fréquence cardiaque moyenne par boucle (bpm)">
              <BackyardLoopTimesChart
                registrations={registrations}
                mode="bpm"
              />
            </ChartCard>
          )}
        </>
      )}
    </div>
  )
}
