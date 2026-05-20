'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings } from 'lucide-react'
import { logoutAction } from '@/actions/auth/auth.actions'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface UserMenuProps {
  userId: string
  firstName?: string | null
  lastName?: string | null
  pseudo?: string | null
  email: string
  isAdmin: boolean
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  return email?.slice(0, 2).toUpperCase() ?? '?'
}

export default function UserMenu({
  firstName,
  lastName,
  pseudo,
  email,
  isAdmin,
}: UserMenuProps) {
  const router = useRouter()
  const t = useTranslations('UserMenu')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const initials = getInitials(firstName, lastName, email)
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : email

  const handleLogout = async () => {
    setLoading(true)
    await logoutAction()
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <Button
        variant="sienna"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full w-10 h-10 font-semibold text-sm"
        aria-label="Menu utilisateur"
      >
        {initials}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className={cn(
              'absolute right-0 top-12 z-50 w-56 rounded-2xl bg-card border border-border shadow-xl overflow-hidden',
              'animate-in fade-in slide-in-from-top-2 duration-150'
            )}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="font-semibold text-sm text-foreground truncate">
                {displayName}
              </p>
              {pseudo && (
                <p className="text-xs text-muted-foreground truncate">
                  @{pseudo}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                {t('profile')}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  {t('admin')}
                </Link>
              )}
            </div>

            <div className="border-t border-border py-1">
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground w-full justify-start h-auto rounded-none"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
