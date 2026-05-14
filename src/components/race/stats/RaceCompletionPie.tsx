'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RegistrationStatus } from '@prisma/client'
import type { RegistrationSummary } from '@/actions/race/race.types'

const STATUS_CONFIG: Record<
  RegistrationStatus,
  { label: string; color: string }
> = {
  VALIDATED: { label: 'Finishers', color: '#22c55e' },
  REGISTERED: { label: 'En cours', color: 'hsl(var(--primary))' },
  PENDING: { label: 'En attente', color: '#f59e0b' },
  DNF: { label: 'DNF', color: '#ef4444' },
  DNS: { label: 'DNS', color: '#94a3b8' },
  DISQUALIFIED: { label: 'DQ', color: '#f97316' },
}

const ORDER: RegistrationStatus[] = [
  RegistrationStatus.VALIDATED,
  RegistrationStatus.REGISTERED,
  RegistrationStatus.PENDING,
  RegistrationStatus.DNF,
  RegistrationStatus.DNS,
  RegistrationStatus.DISQUALIFIED,
]

type Props = { registrations: RegistrationSummary[] }

export function RaceCompletionPie({ registrations }: Props) {
  const counts = new Map<RegistrationStatus, number>()
  for (const r of registrations) {
    counts.set(r.status, (counts.get(r.status) ?? 0) + 1)
  }

  const data = ORDER.filter((s) => counts.get(s)).map((s) => ({
    name: STATUS_CONFIG[s].label,
    value: counts.get(s)!,
    color: STATUS_CONFIG[s].color,
  }))

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-md">
                <p className="font-semibold text-foreground">{d.name}</p>
                <p className="text-muted-foreground">
                  {d.value} participant{d.value > 1 ? 's' : ''}
                </p>
              </div>
            )
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
