'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Loop = {
  loopNumber: number
  heartRateAvg: number | null
  heartRateMax: number | null
}

type Props = { loops: Loop[] }

export function PersonalBpmChart({ loops }: Props) {
  const data = loops
    .filter((l) => l.heartRateAvg)
    .map((l) => ({
      loop: `B${l.loopNumber}`,
      avg: l.heartRateAvg,
      max: l.heartRateMax ?? undefined,
    }))

  if (data.length === 0) return null

  return (
    <div className="space-y-1.5 pt-1">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        Fréquence cardiaque / boucle
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
          <XAxis
            dataKey="loop"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-md space-y-0.5">
                  <p className="font-semibold text-foreground">{label}</p>
                  {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color as string }}>
                      {p.name === 'avg' ? 'Moy.' : 'Max'} — {p.value} bpm
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="max"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={{ r: 2, strokeWidth: 0, fill: '#f59e0b' }}
            activeDot={{ r: 4 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
