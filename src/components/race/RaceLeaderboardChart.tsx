'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type Entry = {
  name: string
  value: number
  rank: number
}

type Props = {
  registrations: Entry[]
  mode?: 'time' | 'loops'
}

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}h${m.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}"`
}

function formatSecondsShort(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#b45309']

export function RaceLeaderboardChart({ registrations, mode = 'time' }: Props) {
  const isLoops = mode === 'loops'

  const data = registrations
    .filter((r) => r.value > 0)
    .sort((a, b) => (isLoops ? b.value - a.value : a.value - b.value))
    .slice(0, 20)
    .map((r) => ({
      name: r.name.length > 16 ? r.name.slice(0, 14) + '…' : r.name,
      fullName: r.name,
      value: r.value,
      rank: r.rank,
    }))

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 60, bottom: 0, left: 8 }}
        barCategoryGap="20%"
      >
        <XAxis
          type="number"
          dataKey="value"
          tickFormatter={isLoops ? (v) => `${v}` : formatSecondsShort}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            const label = isLoops
              ? `${d.value} boucle${d.value > 1 ? 's' : ''}`
              : formatSeconds(d.value)
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">{d.fullName}</p>
                <p className="text-muted-foreground">
                  #{d.rank} — {label}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={4} maxBarSize={20}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index < 3 ? PODIUM_COLORS[index] : 'hsl(var(--primary))'}
              opacity={index < 3 ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
