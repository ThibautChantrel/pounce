'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { RegistrationSummary } from '@/actions/race/race.types'

type Props = { registrations: RegistrationSummary[] }

export function BackyardSurvivalChart({ registrations }: Props) {
  const maxLoops = Math.max(
    0,
    ...registrations.map(
      (r) => r.backyardLoops.filter((l) => l.status === 'VALIDATED').length
    )
  )

  if (maxLoops === 0) return null

  const data = Array.from({ length: maxLoops }, (_, i) => {
    const loopNum = i + 1
    const survivors = registrations.filter((r) =>
      r.backyardLoops.some(
        (l) => l.loopNumber === loopNum && l.status === 'VALIDATED'
      )
    ).length
    return { loop: loopNum, survivors }
  })

  const maxSurvivors = data[0]?.survivors ?? 0

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 16, bottom: 0, left: -10 }}
      >
        <defs>
          <linearGradient id="survivalGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          vertical={false}
        />
        <XAxis
          dataKey="loop"
          tickFormatter={(v) => `B${v}`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, maxSurvivors]}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">Boucle {d.loop}</p>
                <p className="text-muted-foreground">
                  {d.survivors} participant{d.survivors > 1 ? 's' : ''} en
                  course
                </p>
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="survivors"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#survivalGradient)"
          dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
