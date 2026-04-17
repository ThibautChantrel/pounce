import { notFound } from 'next/navigation'
import { getUser } from '@/actions/user/user.admin.actions'
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

type UserType = Awaited<ReturnType<typeof getUser>>

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Homme',
  FEMALE: 'Femme',
  NON_BINARY: 'Non binaire',
  OTHER: 'Autre',
}

export default async function UserShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Users')

  const user = await getUser(params.id)
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
            Vérifié le {new Date(u.emailVerified).toLocaleDateString('fr-FR')}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-amber-600 bg-amber-50 border-amber-200"
          >
            Non vérifié
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
          {u.isVerified ? 'Oui' : 'Non'}
        </Badge>
      ),
    },
    {
      label: t('isCertified'),
      key: 'isCertified',
      type: 'custom',
      getValue: (u: UserType) => (
        <Badge variant={u.isCertified ? 'default' : 'secondary'}>
          {u.isCertified ? 'Certifié' : 'Non certifié'}
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
          {u.stravaId ? `Connecté (${u.stravaId})` : 'Non connecté'}
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
      </div>
    </ShowLayout>
  )
}
