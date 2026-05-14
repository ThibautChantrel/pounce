'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { RegistrationSummary } from '@/actions/race/race.types'

const COLORS = [
  'hsl(var(--primary))',
  '#f59e0b',
  '#22c55e',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

function shortName(r: RegistrationSummary) {
  const full = `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim()
  return full || r.user.pseudo || r.user.email.split('@')[0]
}

function formatMin(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}'${sec.toString().padStart(2, '0')}"`
}

type Props = {
  registrations: RegistrationSummary[]
  mode: 'time' | 'speed' | 'bpm'
}

export function BackyardLoopTimesChart({ registrations, mode }: Props) {
  const active = registrations.filter((r) =>
    r.backyardLoops.some((l) => l.status === 'VALIDATED')
  )

  if (active.length === 0) return null

  const maxLoops = Math.max(
    ...active.map(
      (r) => r.backyardLoops.filter((l) => l.status === 'VALIDATED').length
    )
  )

  const data = Array.from({ length: maxLoops }, (_, i) => {
    const loopNum = i + 1
    const point: Record<string, number | null | string> = {
      loop: `B${loopNum}`,
    }
    for (const reg of active) {
      const loop = reg.backyardLoops.find(
        (l) => l.loopNumber === loopNum && l.status === 'VALIDATED'
      )
      const name = shortName(reg)
      if (mode === 'time') {
        point[name] = loop?.timeSeconds ?? null
      } else if (mode === 'speed') {
        point[name] = loop?.avgSpeed
          ? Math.round(loop.avgSpeed * 10) / 10
          : null
      } else {
        point[name] = loop?.heartRateAvg ?? null
      }
    }
    return point
  })

  const yTickFormatter =
    mode === 'time'
      ? (v: number) => formatMin(v)
      : mode === 'speed'
        ? (v: number) => `${v} km/h`
        : (v: number) => `${v} bpm`

  const tooltipFormatter =
    mode === 'time'
      ? (v: number) => formatMin(v)
      : mode === 'speed'
        ? (v: number) => `${v} km/h`
        : (v: number) => `${v} bpm`

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 16, bottom: 0, left: -4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="loop"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yTickFormatter}
          width={mode === 'time' ? 42 : 58}
        />
        <Tooltip
          content={({ active: a, payload, label }) => {
            if (!a || !payload?.length) return null
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md space-y-1">
                <p className="font-semibold text-foreground">{label}</p>
                {payload.map((p, i) => (
                  <p key={i} style={{ color: p.color as string }}>
                    {p.name} — {tooltipFormatter(p.value as number)}
                  </p>
                ))}
              </div>
            )
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
        {active.map((reg, i) => (
          <Line
            key={reg.id}
            type="monotone"
            dataKey={shortName(reg)}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
