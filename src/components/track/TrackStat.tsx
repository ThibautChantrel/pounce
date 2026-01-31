'use client'

import { MapPin, Mountain, Navigation, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '../ui/badge'
import { useTranslations } from 'next-intl'

type Props = {
  distance: number
  elevationGain?: number
  poisCount: number
  gpxUrl: string
}

export function TrackInlineStats({
  distance,
  elevationGain = 0,
  poisCount,
  gpxUrl,
}: Props) {
  const t = useTranslations('Tracks')

  const handleDownload = () => {
    window.open(gpxUrl, '_blank')
  }

  return (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm font-medium text-muted-foreground">
      {/* <Badge variant="secondary">test</Badge> */}

      <span className="flex items-center">
        <Navigation className="w-4 h-4 mr-1.5" />
        {distance.toFixed(1)} km
      </span>

      <span className="flex items-center">
        <Mountain className="w-4 h-4 mr-1.5" />
        {elevationGain} m
      </span>

      <span className="flex items-center">
        <MapPin className="w-4 h-4 mr-1.5" />
        {poisCount} {t('pois')}
      </span>

      {gpxUrl && (
        <Button
          size="sm"
          className="ml-2 bg-canopy text-white hover:bg-canopy/90"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-1.5" />
          GPX
        </Button>
      )}
    </div>
  )
}
