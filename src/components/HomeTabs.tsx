'use client'

import { useState } from 'react'
import { Flag, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RaceCarousel } from '@/components/race/RaceCarousel'
import { ChallengeCarousel } from '@/components/challenge/ChallengeCaroussel'

type Tab = 'challenges' | 'races'

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  {
    value: 'challenges',
    label: 'Défis',
    icon: <Trophy className="w-3.5 h-3.5" />,
  },
  {
    value: 'races',
    label: 'Courses',
    icon: <Flag className="w-3.5 h-3.5" />,
  },
]

export function HomeTabs() {
  const [tab, setTab] = useState<Tab>('challenges')

  return (
    <div className="w-full flex flex-col items-center gap-0">
      <div className="bg-muted rounded-full p-1 flex mb-6">
        {TABS.map((t) => (
          <Button
            key={t.value}
            variant="ghost"
            onClick={() => setTab(t.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 h-auto cursor-pointer',
              tab === t.value
                ? 'bg-card text-foreground shadow-sm hover:bg-card hover:text-foreground'
                : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
            )}
          >
            {t.icon}
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'challenges' && <ChallengeCarousel />}
      {tab === 'races' && <RaceCarousel />}
    </div>
  )
}
