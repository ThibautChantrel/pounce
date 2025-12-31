'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction } from '@/actions/auth/auth.actions'
import { useRouter } from 'next/navigation'

interface LogoutState {
  success: boolean
}

const initialState: LogoutState = {
  success: false,
}

export default function LogoutButton() {
  const router = useRouter()
  const [state, action, pending] = useActionState(logoutAction, initialState)

  useEffect(() => {
    if (state.success) {
      router.refresh()
      toast.success('Déconnexion réussie')
    }
  }, [state.success, router])

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        className="flex items-center gap-2"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Se déconnecter
      </Button>
    </form>
  )
}
