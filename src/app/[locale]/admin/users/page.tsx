import { fetchUsers } from '@/actions/user/user.actions'
import UsersTable from '@/components/admin/users/UserTable'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage(props: PageProps) {
  const searchParams = await props.searchParams

  // 1. Gestion des paramètres d'URL
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10
  const search = (searchParams.search as string) || ''
  const skip = (page - 1) * limit

  // 2. Récupération des données (Serveur)
  const { data, total } = await fetchUsers(skip, limit, search)

  // 3. Traduction du titre (Serveur)
  const t = await getTranslations('Admin.Users')

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description', { count: total })}
          </p>
        </div>
      </div>

      <UsersTable data={data} totalItems={total} />
    </div>
  )
}
