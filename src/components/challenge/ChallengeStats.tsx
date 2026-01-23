import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Calendar } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface ChallengeStatsProps {
  totalDistance: number
  totalElevation: number
  tracksCount: number
  createdAt: Date
}

export async function ChallengeStats({
  totalDistance,
  totalElevation,
  tracksCount,
  createdAt,
}: ChallengeStatsProps) {
  const t = await getTranslations('Challenges.ChallengeDetail')

  return (
    <Card className="border-none shadow-md bg-white canopy sticky top-24">
      <CardContent className="p-6 space-y-6">
        <h3 className="font-semibold text-lg flex items-center gap-2 text-canopy">
          <Trophy className="w-5 h-5 text-canopy" />
          {t('statsTitle')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col p-3 bg-clay text-canopy rounded-lg">
            <span className="text-xs text-muted-foreground uppercase">
              {t('totalDistance')}
            </span>
            <span className="text-2xl font-bold font-mono">
              {totalDistance.toFixed(1)}{' '}
              <span className="text-sm font-normal">km</span>
            </span>
          </div>
          <div className="flex flex-col p-3 bg-clay text-canopy rounded-lg">
            <span className="text-xs text-muted-foreground uppercase">
              {t('totalElevation')}
            </span>
            <span className="text-2xl font-bold font-mono">
              {totalElevation} <span className="text-sm font-normal">m</span>
            </span>
          </div>
          <div className="col-span-2 flex flex-col p-3 bg-clay text-canopy rounded-lg">
            <span className="text-xs text-muted-foreground uppercase">
              {t('tracksCount')}
            </span>
            <span className="text-2xl font-bold font-mono">
              {tracksCount}{' '}
              <span className="text-sm font-normal">{t('stages')}</span>
            </span>
          </div>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {t('createdOn', { date: new Date(createdAt).toLocaleDateString() })}
        </div>
      </CardContent>
    </Card>
  )
}
