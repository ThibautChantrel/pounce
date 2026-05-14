'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { RaceStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  adminValidateRaceAction,
  adminRejectRaceAction,
} from '@/actions/race/race.admin.actions'

type Props = {
  race: { id: string; status: RaceStatus }
}

export function RaceAdminActions({ race }: Props) {
  const router = useRouter()
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (race.status !== RaceStatus.PENDING_REVIEW) return null

  async function handleValidate() {
    setLoading(true)
    const res = await adminValidateRaceAction(race.id)
    setLoading(false)
    if (res.success) {
      toast.success('Course validée')
      router.refresh()
    } else toast.error('Erreur lors de la validation')
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error('Motif requis')
      return
    }
    setLoading(true)
    const res = await adminRejectRaceAction(race.id, rejectReason)
    setLoading(false)
    if (res.success) {
      toast.success('Course refusée')
      router.refresh()
    } else toast.error('Erreur lors du refus')
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <div className="flex gap-2">
        <Button
          onClick={handleValidate}
          disabled={loading}
          size="sm"
          className="gap-1.5"
        >
          <CheckCircle className="w-4 h-4" /> Valider
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowReject(!showReject)}
          size="sm"
          className="gap-1.5"
        >
          <XCircle className="w-4 h-4" /> Refuser
        </Button>
      </div>
      {showReject && (
        <div className="flex gap-2">
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motif du refus..."
            className="flex-1 h-8 text-sm"
          />
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading}
            size="sm"
          >
            Confirmer
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowReject(false)}
            size="sm"
          >
            Annuler
          </Button>
        </div>
      )}
    </div>
  )
}
