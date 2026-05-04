'use client'

import { useState } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { manualSyncRaceStravaAction } from '@/actions/race/race.actions'

type Props = {
  raceId: string
}

export function ManualRaceSyncButton({ raceId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    const res = await manualSyncRaceStravaAction(raceId)
    setLoading(false)

    if (!res.success) {
      toast.error('Impossible de synchroniser Strava')
      return
    }

    toast.success(
      `Synchro terminée: ${res.syncedActivities} activité(s), ${res.syncedUsers} participant(s)`
    )
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSync}
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Synchronisation...' : 'Synchroniser Strava'}
    </Button>
  )
}
