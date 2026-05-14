'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import type { RegistrationSummary } from '@/actions/race/race.types'

function formatMin(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}'${sec.toString().padStart(2, '0')}"`
}

type Props = { registrations: RegistrationSummary[] }

export function BackyardAvgLoopChart({ registrations }: Props) {
  const maxLoops = Math.max(
    0,
    ...registrations.map(
      (r) => r.backyardLoops.filter((l) => l.status === 'VALIDATED').length
    )
  )

  if (maxLoops === 0) return null

  const data = Array.from({ length: maxLoops }, (_, i) => {
    const loopNum = i + 1
    const times = registrations
      .flatMap((r) => r.backyardLoops)
      .filter(
        (l) =>
          l.loopNumber === loopNum && l.status === 'VALIDATED' && l.timeSeconds
      )
      .map((l) => l.timeSeconds!)
    const avg = times.length
      ? Math.round(times.reduce((s, v) => s + v, 0) / times.length)
      : null
    return { loop: `B${loopNum}`, avg, count: times.length }
  }).filter((d) => d.avg !== null)

  if (data.length === 0) return null

  const minAvg = Math.min(...data.map((d) => d.avg!))
  const maxAvg = Math.max(...data.map((d) => d.avg!))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: -4 }}>
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
          tickFormatter={formatMin}
          domain={[minAvg * 0.97, maxAvg * 1.02]}
          width={42}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">{d.loop}</p>
                <p className="text-muted-foreground">
                  Moy. {formatMin(d.avg)} · {d.count} coureur
                  {d.count > 1 ? 's' : ''}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="avg" radius={4} maxBarSize={32}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill="hsl(var(--primary))"
              opacity={0.5 + (i / Math.max(data.length - 1, 1)) * 0.5}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
