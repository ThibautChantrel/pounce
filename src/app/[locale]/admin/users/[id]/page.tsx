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

export default async function UserShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Users')

  const user = await getUser(params.id)

  if (!user) {
    notFound()
  }

  const userFields: FieldConfig<NonNullable<UserType>>[] = [
    {
      label: t('name'),
      key: 'name',
      className: 'font-semibold text-lg',
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
        ADMIN: 'destructive', // Rouge pour admin
        USER: 'secondary', // Gris pour user
        // Autres rôles si nécessaire
      },
    },
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
            Vérifié
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-amber-600 bg-amber-50 border-amber-200"
          >
            En attente
          </Badge>
        ),
    },
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
          title="Informations du compte"
          description={`ID: ${user.id}`}
          data={user}
          fields={userFields}
        />
      </div>
    </ShowLayout>
  )
}
