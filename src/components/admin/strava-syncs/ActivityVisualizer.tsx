'use client'

import { useState } from 'react'
import { Map, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'

const ActivityMap = dynamic(() => import('./ActivityMap'), { ssr: false })

type Props = {
  activityId: string
  userId: string
  trackId?: string | null
  trackTitle?: string | null
}

type ActivityData = {
  name: string
  distance: number
  movingTime: number
  avgSpeed: number
  points: { lat: number; lon: number }[]
  referencePoints: { lat: number; lon: number }[]
}

export default function ActivityVisualizer({
  activityId,
  userId,
  trackId,
  trackTitle,
}: Props) {
  const t = useTranslations('Admin.StravaSyncs')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ActivityData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = async () => {
    setOpen(true)
    if (data) return

    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ userId })
      if (trackId) params.set('trackId', trackId)
      const res = await fetch(`/api/strava/activity/${activityId}?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-1.5"
      >
        <Map className="w-3.5 h-3.5" />
        {t('visualize')}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <p className="font-semibold text-sm">
                  {t('activityId')}{' '}
                  <span className="font-mono">{activityId}</span>
                  {data?.name && (
                    <span className="ml-2 text-muted-foreground">
                      — {data.name}
                    </span>
                  )}
                </p>
                {trackTitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('referenceTrack')} :{' '}
                    <span className="font-medium">{trackTitle}</span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats bar */}
            {data && (
              <div className="flex items-center gap-6 px-5 py-2.5 bg-muted/30 border-b text-sm text-muted-foreground">
                <span>{(data.distance / 1000).toFixed(1)} km</span>
                <span>
                  {Math.floor(data.movingTime / 3600)}h{' '}
                  {Math.floor((data.movingTime % 3600) / 60)}min
                </span>
                <span>{data.avgSpeed.toFixed(1)} km/h</span>
              </div>
            )}

            {/* Map area */}
            <div className="flex-1 min-h-0 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
                  {t('visualizeError')} : {error}
                </div>
              )}
              {data && data.points.length > 0 && (
                <ActivityMap
                  activityPoints={data.points}
                  referencePoints={data.referencePoints}
                />
              )}
              {data && data.points.length === 0 && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  {t('noPolyline')}
                </div>
              )}
            </div>

            {/* Legend */}
            {data && (
              <div className="flex items-center gap-5 px-5 py-3 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-orange-500 inline-block rounded" />
                  {t('legendActivity')}
                </span>
                {data.referencePoints.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-blue-500 inline-block rounded" />
                    {t('legendReference')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
