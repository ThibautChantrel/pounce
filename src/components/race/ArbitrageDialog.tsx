'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Map } from 'lucide-react'

const ActivityMap = dynamic(
  () => import('@/components/admin/strava-syncs/ActivityMap'),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-muted animate-pulse rounded-xl" />,
  }
)

type LatLon = { lat: number; lon: number }

type ArbitrageData = {
  userName: string
  activityName: string
  activityPoints: LatLon[]
  referencePoints: LatLon[]
}

type Props = {
  raceId: string
  registrationId: string
  participantName: string
  open: boolean
  onClose: () => void
}

export function ArbitrageDialog({
  raceId,
  registrationId,
  participantName,
  open,
  onClose,
}: Props) {
  const [data, setData] = useState<ArbitrageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/races/${raceId}/arbitrage/${registrationId}`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('Impossible de charger les données')
        return r.json()
      })
      .then((d: ArbitrageData) => {
        setData(d)
        setLoading(false)
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') {
          setError(e.message)
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [raceId, registrationId])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Arbitrage — {participantName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {loading && (
            <div className="h-80 bg-muted animate-pulse rounded-xl" />
          )}
          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}
          {data && !loading && (
            <>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-1.5 rounded bg-blue-500" />
                  Parcours officiel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-1.5 rounded bg-orange-500" />
                  Activité Strava — {data.activityName}
                </span>
              </div>
              <div className="h-80 rounded-xl overflow-hidden border border-border">
                <ActivityMap
                  activityPoints={data.activityPoints}
                  referencePoints={data.referencePoints}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
