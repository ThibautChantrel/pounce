'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  LogOut,
  Activity,
  User,
  RefreshCw,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { logoutAction } from '@/actions/auth/auth.actions'
import { manualResyncAction } from '@/actions/strava/strava.actions'
import {
  fetchUnreadCertifications,
  markCertificationsAsRead,
} from '@/actions/user/user.certifications.actions'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { CertificationCelebration } from '@/components/profile/CertificationCelebration'

type UserProfile = {
  id: string
  pseudo: string | null
  firstName: string | null
  lastName: string | null
  email: string
  nationality: string | null
  gender: string | null
  birthDate: Date | null
  height: number | null
  weight: number | null
}

type StravaStatus = {
  connected: boolean
  stravaId: string | null
  lastResyncAt: Date | null
  canResync: boolean
}

type UnreadCertifications = {
  trackCertificationIds: string[]
  challengeCertificationIds: string[]
  trackTitles: string[]
  challengeTitles: string[]
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

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">
        {value || '-'}
      </span>
    </div>
  )
}

export default function ProfileClient({
  user,
  stravaStatus,
  initialUnreadCertifications,
  children,
}: {
  user: UserProfile
  stravaStatus: StravaStatus
  initialUnreadCertifications: UnreadCertifications
  children?: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('Profile')
  const tAuth = useTranslations('Auth')

  const [isSyncing, setIsSyncing] = useState(false)
  const [canResync, setCanResync] = useState(stravaStatus.canResync)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationTracks, setCelebrationTracks] = useState<string[]>([])
  const [celebrationChallenges, setCelebrationChallenges] = useState<string[]>(
    []
  )
  const [unreadToMark, setUnreadToMark] = useState<{
    trackCertificationIds: string[]
    challengeCertificationIds: string[]
  }>({ trackCertificationIds: [], challengeCertificationIds: [] })

  const GENDER_LABELS: Record<string, string> = {
    MALE: tAuth('genderMale'),
    FEMALE: tAuth('genderFemale'),
    NON_BINARY: tAuth('genderNonBinary'),
    OTHER: tAuth('genderOther'),
  }

  useEffect(() => {
    const stravaParam = searchParams.get('strava')
    if (stravaParam === 'connected') {
      toast.success(t('stravaConnectedSuccess'))
      router.replace('/profile')
    } else if (stravaParam === 'denied') {
      toast.info(t('stravaConnectionDenied'))
      router.replace('/profile')
    } else if (stravaParam === 'conflict') {
      toast.error(t('stravaConnectionConflict'))
      router.replace('/profile')
    } else if (stravaParam === 'error') {
      toast.error(t('stravaConnectionError'))
      router.replace('/profile')
    }
  }, [searchParams, router, t])

  useEffect(() => {
    const unreadCount =
      initialUnreadCertifications.trackCertificationIds.length +
      initialUnreadCertifications.challengeCertificationIds.length

    if (unreadCount === 0) return

    setCelebrationTracks(initialUnreadCertifications.trackTitles)
    setCelebrationChallenges(initialUnreadCertifications.challengeTitles)
    setUnreadToMark({
      trackCertificationIds: initialUnreadCertifications.trackCertificationIds,
      challengeCertificationIds:
        initialUnreadCertifications.challengeCertificationIds,
    })
    setShowCelebration(true)
  }, [initialUnreadCertifications])

  const initials = getInitials(user.firstName, user.lastName, user.email)
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email

  const handleLogout = async () => {
    await logoutAction()
    router.refresh()
    router.push('/')
  }

  const handleResync = async () => {
    setIsSyncing(true)
    try {
      const result = await manualResyncAction()
      if (!result.success) {
        if (result.error === 'rate_limited') {
          if (result.nextResyncAt) {
            const timeStr = result.nextResyncAt.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            toast.error(t('stravaResyncRateLimitedUntil', { time: timeStr }))
          } else {
            toast.error(t('stravaResyncRateLimited'))
          }
        } else if (result.error === 'strava_api_error') {
          toast.error(t('stravaResyncApiError'))
        } else if (result.error === 'no_provider_connected') {
          toast.error(t('stravaResyncNoProvider'))
        } else {
          toast.error(t('stravaResyncError'))
        }
        return
      }

      const count =
        (result.certifiedTrackIds?.length ?? 0) +
        (result.certifiedChallengeIds?.length ?? 0)

      if (count > 0) {
        toast.success(t('stravaResyncSuccess', { count }))

        setCelebrationTracks(result.certifiedTrackTitles ?? [])
        setCelebrationChallenges(result.certifiedChallengeTitles ?? [])

        const unread = await fetchUnreadCertifications()
        setUnreadToMark({
          trackCertificationIds: unread.trackCertificationIds,
          challengeCertificationIds: unread.challengeCertificationIds,
        })
        setShowCelebration(true)
      } else {
        toast.info(t('stravaResyncNoNew'))
      }

      setCanResync(false)
    } finally {
      setIsSyncing(false)
    }
  }

  const birthDateStr = user.birthDate
    ? new Date(user.birthDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null

  return (
    <>
      <CertificationCelebration
        open={showCelebration}
        trackTitles={celebrationTracks}
        challengeTitles={celebrationChallenges}
        onClose={() => {
          setShowCelebration(false)
          router.refresh()
        }}
        onViewed={async () => {
          if (
            unreadToMark.trackCertificationIds.length === 0 &&
            unreadToMark.challengeCertificationIds.length === 0
          ) {
            return
          }
          await markCertificationsAsRead(unreadToMark)
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-16">
        {/* Profile header banner */}
        <div className="rounded-2xl bg-primary text-primary-foreground p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-full bg-sienna flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{displayName}</h1>
              <p className="text-primary-foreground/70 text-sm truncate">
                {user.pseudo && `@${user.pseudo} · `}
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="self-start sm:self-auto shrink-0 rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            {t('logout')}
          </Button>
        </div>

        {/* Personal info card */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5">
            <User className="w-4 h-4" />
            {t('personalInfo')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <InfoField label={t('firstName')} value={user.firstName} />
            <InfoField label={t('lastName')} value={user.lastName} />
            <InfoField
              label={t('pseudo')}
              value={user.pseudo ? `@${user.pseudo}` : null}
            />
            <InfoField label={t('email')} value={user.email} />
            <InfoField label={t('nationality')} value={user.nationality} />
            <InfoField
              label={t('gender')}
              value={user.gender ? GENDER_LABELS[user.gender] : null}
            />
            <InfoField label={t('birthDate')} value={birthDateStr} />
            <InfoField
              label={t('height')}
              value={user.height ? `${user.height} cm` : null}
            />
            <InfoField
              label={t('weight')}
              value={user.weight ? `${user.weight} kg` : null}
            />
          </div>
        </div>

        {/* Strava card */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100  flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground flex-1">
                  {t('stravaTitle')}
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
                      aria-label={t('stravaResyncInfoTitle')}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="text-sm space-y-2">
                    <p className="font-semibold text-foreground">
                      {t('stravaResyncInfoTitle')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('stravaResyncInfoAuto')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('stravaResyncInfoManual')}
                    </p>
                    <p className="text-muted-foreground">
                      {t('stravaResyncInfoLimit')}
                    </p>
                    <p className="text-xs text-muted-foreground/70 pt-1 border-t border-border">
                      {stravaStatus.lastResyncAt
                        ? t('stravaResyncInfoLastSync', {
                            date: new Date(
                              stravaStatus.lastResyncAt
                            ).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                          })
                        : t('stravaResyncInfoNeverSynced')}
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                {t('stravaDesc')}
              </p>

              <ul className="mt-3 space-y-1.5">
                {[
                  t('stravaFeature1'),
                  t('stravaFeature2'),
                  t('stravaFeature3'),
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-sienna">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5 pt-5 border-t border-border">
            {stravaStatus.connected ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600 flex-1 min-w-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {t('stravaConnectedId', {
                      id: stravaStatus.stravaId ?? '',
                    })}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full self-start sm:self-auto shrink-0"
                  onClick={handleResync}
                  disabled={isSyncing || !canResync}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`}
                  />
                  {isSyncing ? t('stravasyncingBtn') : t('stravaResyncBtn')}
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground flex-1">
                  {t('stravaNotConnected')}
                </span>
                <Button
                  className="rounded-full self-start sm:self-auto shrink-0"
                  onClick={() => {
                    window.location.href = '/api/strava/connect'
                  }}
                >
                  <Activity className="w-4 h-4 mr-1.5" />
                  {t('stravaConnectBtn')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Certifications sections */}
        {children}
      </div>
    </>
  )
}
