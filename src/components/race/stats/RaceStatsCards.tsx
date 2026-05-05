'use client'

import { RaceFormat } from '@prisma/client'
import type { RaceDetail } from '@/actions/race/race.types'

function formatTime(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}h${m.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}"`
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground leading-tight">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

export function RaceStatsCards({ race }: { race: RaceDetail }) {
  const regs = race.registrations
  const isBackyard = race.format === RaceFormat.BACKYARD

  if (isBackyard) {
    const active = regs.filter(
      (r) => r.status === 'REGISTERED' || r.status === 'VALIDATED'
    )
    const allLoops = regs.flatMap((r) =>
      r.backyardLoops.filter((l) => l.status === 'VALIDATED')
    )
    const maxLoops = allLoops.length
      ? Math.max(
          ...regs.map(
            (r) =>
              r.backyardLoops.filter((l) => l.status === 'VALIDATED').length
          )
        )
      : 0
    const avgLoops =
      regs.length > 0
        ? (
            regs.reduce(
              (s, r) =>
                s +
                r.backyardLoops.filter((l) => l.status === 'VALIDATED').length,
              0
            ) / regs.length
          ).toFixed(1)
        : '—'

    const bpmValues = allLoops
      .filter((l) => l.heartRateAvg)
      .map((l) => l.heartRateAvg!)
    const avgBpm = bpmValues.length
      ? Math.round(bpmValues.reduce((s, v) => s + v, 0) / bpmValues.length)
      : null

    const avgTimes = allLoops
      .filter((l) => l.timeSeconds)
      .map((l) => l.timeSeconds!)
    const avgLoop = avgTimes.length
      ? Math.round(avgTimes.reduce((s, v) => s + v, 0) / avgTimes.length)
      : null

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Participants" value={String(race.registrationCount)} />
        <StatCard
          label="Encore en course"
          value={String(active.length)}
          sub={`${Math.round((active.length / race.registrationCount) * 100)}% de survie`}
        />
        <StatCard
          label="Boucles max"
          value={String(maxLoops)}
          sub="record de l'épreuve"
        />
        <StatCard
          label="Moy. boucles"
          value={avgLoops.toString()}
          sub="par participant"
        />
        <StatCard
          label="Temps moy. / boucle"
          value={avgLoop ? formatTime(avgLoop) : '—'}
          sub={avgBpm ? `${avgBpm} bpm en moyenne` : undefined}
        />
      </div>
    )
  }

  // ONE_SHOT
  const validated = regs.filter(
    (r) => r.status === 'VALIDATED' && r.totalTimeSeconds
  )
  const dnf = regs.filter((r) => r.status === 'DNF').length
  const dns = regs.filter((r) => r.status === 'DNS').length
  const dq = regs.filter((r) => r.status === 'DISQUALIFIED').length
  const finishRate =
    validated.length + dnf > 0
      ? Math.round((validated.length / (validated.length + dnf)) * 100)
      : null

  const times = validated.map((r) => r.totalTimeSeconds!)
  const avgTime = times.length
    ? Math.round(times.reduce((s, v) => s + v, 0) / times.length)
    : null

  const sorted = [...times].sort((a, b) => a - b)
  const medianTime =
    sorted.length > 0
      ? sorted.length % 2 === 0
        ? Math.round(
            (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          )
        : sorted[Math.floor(sorted.length / 2)]
      : null

  const gap = sorted.length >= 2 ? sorted[sorted.length - 1] - sorted[0] : null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard label="Inscrits" value={String(race.registrationCount)} />
      <StatCard
        label="Finishers"
        value={`${validated.length}/${race.registrationCount - dns}`}
        sub={
          finishRate !== null ? `${finishRate}% de taux de finition` : undefined
        }
      />
      <StatCard
        label="Temps moyen"
        value={avgTime ? formatTime(avgTime) : '—'}
      />
      <StatCard
        label="Temps médian"
        value={medianTime ? formatTime(medianTime) : '—'}
      />
      <StatCard
        label="Écart 1er / dernier"
        value={gap ? formatTime(gap) : '—'}
        sub={
          dnf > 0 || dns > 0 || dq > 0
            ? `${dnf} DNF · ${dns} DNS · ${dq} DQ`
            : undefined
        }
      />
    </div>
  )
}
