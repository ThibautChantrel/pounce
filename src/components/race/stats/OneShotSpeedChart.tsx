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
  ReferenceLine,
} from 'recharts'
import { RegistrationStatus } from '@prisma/client'
import type { RegistrationSummary } from '@/actions/race/race.types'

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#b45309']

function shortName(r: RegistrationSummary) {
  const n = `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim()
  const name = n || r.user.pseudo || r.user.email.split('@')[0]
  return name.length > 14 ? name.slice(0, 12) + '…' : name
}

type Props = {
  registrations: RegistrationSummary[]
  trackDistance: number
}

export function OneShotSpeedChart({ registrations, trackDistance }: Props) {
  const validated = registrations
    .filter(
      (r) => r.status === RegistrationStatus.VALIDATED && r.totalTimeSeconds
    )
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))

  if (validated.length === 0) return null

  const data = validated.map((r) => ({
    name: shortName(r),
    fullName:
      `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim() ||
      r.user.pseudo ||
      '',
    speed: Math.round((trackDistance / (r.totalTimeSeconds! / 3600)) * 10) / 10,
    rank: r.rank,
  }))

  const avgSpeed =
    Math.round((data.reduce((s, d) => s + d.speed, 0) / data.length) * 10) / 10

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 60, bottom: 0, left: 8 }}
        barCategoryGap="20%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          horizontal={false}
        />
        <XAxis
          type="number"
          dataKey="speed"
          tickFormatter={(v) => `${v}`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          unit=" km/h"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine
          x={avgSpeed}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="4 4"
          strokeWidth={1}
          label={{
            value: `moy. ${avgSpeed}`,
            position: 'top',
            fontSize: 10,
            fill: '#94a3b8',
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">
                  {d.fullName || d.name}
                </p>
                <p className="text-muted-foreground">
                  #{d.rank} — {d.speed} km/h
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="speed" radius={4} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={i < 3 ? PODIUM_COLORS[i] : 'hsl(var(--primary))'}
              opacity={i < 3 ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
