import { notFound } from 'next/navigation'
import { getUser } from '@/actions/user/user.admin.actions'
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/navigation'
import db from '@/server/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

type UserType = Awaited<ReturnType<typeof getUser>>

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export default async function UserShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Users')
  const tAuth = await getTranslations('Auth')
  const tGlobal = await getTranslations('Admin.Global')

  const GENDER_LABELS: Record<string, string> = {
    MALE: tAuth('genderMale'),
    FEMALE: tAuth('genderFemale'),
    NON_BINARY: tAuth('genderNonBinary'),
    OTHER: tAuth('genderOther'),
  }

  const [user, trackCertifications, challengeCertifications] =
    await Promise.all([
      getUser(params.id),
      db.trackCertification.findMany({
        where: { userId: params.id },
        include: { track: { select: { id: true, title: true } } },
        orderBy: { completedAt: 'desc' },
      }),
      db.challengeCertification.findMany({
        where: { userId: params.id },
        include: { challenge: { select: { id: true, title: true } } },
        orderBy: { completedAt: 'desc' },
      }),
    ])

  if (!user) notFound()

  const userFields: FieldConfig<NonNullable<UserType>>[] = [
    // --- Identité ---
    {
      label: t('pseudo'),
      key: 'pseudo',
      type: 'custom',
      getValue: (u: UserType) => (
        <span className="font-semibold text-base">
          {u.pseudo ? (
            `@${u.pseudo}`
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      ),
    },
    {
      label: t('firstName'),
      key: 'firstName',
      type: 'string',
    },
    {
      label: t('lastName'),
      key: 'lastName',
      type: 'string',
    },
    {
      label: t('email'),
      key: 'email',
      type: 'string',
    },
    {
      label: t('role'),
      key: 'role',
      type: 'badge',
      badgeVariants: {
        ADMIN: 'destructive',
        USER: 'secondary',
      },
    },

    // --- Profil ---
    {
      label: t('nationality'),
      key: 'nationality',
      type: 'string',
    },
    {
      label: t('gender'),
      key: 'gender',
      type: 'custom',
      getValue: (u: UserType) => (
        <span>{u.gender ? (GENDER_LABELS[u.gender] ?? u.gender) : '—'}</span>
      ),
    },
    {
      label: t('birthDate'),
      key: 'birthDate',
      type: 'date',
    },
    {
      label: t('height'),
      key: 'height',
      type: 'custom',
      getValue: (u: UserType) => (
        <span>{u.height != null ? `${u.height} cm` : '—'}</span>
      ),
    },
    {
      label: t('weight'),
      key: 'weight',
      type: 'custom',
      getValue: (u: UserType) => (
        <span>{u.weight != null ? `${u.weight} kg` : '—'}</span>
      ),
    },

    // --- Statuts ---
    {
      label: t('verified'),
      key: 'emailVerified',
      type: 'custom',
      getValue: (u: UserType) =>
        u.emailVerified ? (
          <Badge
            variant="outline"
            className="text-green-600 bg-green-50 border-green-200"
          >
            {t('emailVerifiedOn', {
              date: new Date(u.emailVerified).toLocaleDateString('fr-FR'),
            })}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-amber-600 bg-amber-50 border-amber-200"
          >
            {t('emailNotVerified')}
          </Badge>
        ),
    },
    {
      label: t('isVerified'),
      key: 'isVerified',
      type: 'custom',
      getValue: (u: UserType) => (
        <Badge
          variant={u.isVerified ? 'outline' : 'secondary'}
          className={
            u.isVerified ? 'text-green-600 bg-green-50 border-green-200' : ''
          }
        >
          {u.isVerified ? tGlobal('yes') : tGlobal('no')}
        </Badge>
      ),
    },
    {
      label: t('isCertified'),
      key: 'isCertified',
      type: 'custom',
      getValue: (u: UserType) => (
        <Badge variant={u.isCertified ? 'default' : 'secondary'}>
          {u.isCertified ? t('certified') : t('notCertified')}
        </Badge>
      ),
    },
    {
      label: t('stravaConnected'),
      key: 'stravaId',
      type: 'custom',
      getValue: (u: UserType) => (
        <Badge
          variant={u.stravaId ? 'outline' : 'secondary'}
          className={
            u.stravaId ? 'text-orange-600 bg-orange-50 border-orange-200' : ''
          }
        >
          {u.stravaId
            ? t('stravaConnectedId', { id: u.stravaId })
            : t('stravaNotConnected')}
        </Badge>
      ),
    },

    // --- Audit ---
    {
      label: t('createdAt'),
      key: 'createdAt',
      type: 'date',
    },
    {
      label: t('lastUpdate'),
      key: 'updatedAt',
      type: 'date',
    },
  ]

  return (
    <ShowLayout module="users">
      <div className="space-y-6">
        <DataDetails
          title={t('info')}
          description={`ID: ${user.id}`}
          data={user}
          fields={userFields}
        />

        {/* Track certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('trackCertifications')}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({trackCertifications.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trackCertifications.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {tGlobal('noCertifications')}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {trackCertifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <Link
                      href={`/admin/tracks/${cert.track.id}`}
                      className="group flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors min-w-0"
                    >
                      <span className="truncate">{cert.track.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="flex items-center gap-3 shrink-0 text-sm text-muted-foreground">
                      <span>
                        {new Date(cert.completedAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span>{formatDuration(cert.totalTime)}</span>
                      <span>{cert.avgSpeed.toFixed(1)} km/h</span>
                      {cert.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Challenge certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('challengeCertifications')}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({challengeCertifications.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {challengeCertifications.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {tGlobal('noCertifications')}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {challengeCertifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <Link
                      href={`/admin/challenges/${cert.challenge.id}`}
                      className="group flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors min-w-0"
                    >
                      <span className="truncate">{cert.challenge.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <div className="flex items-center gap-3 shrink-0 text-sm text-muted-foreground">
                      <span>
                        {new Date(cert.completedAt).toLocaleDateString('fr-FR')}
                      </span>
                      {cert.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ShowLayout>
  )
}
