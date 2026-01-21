import { fetchChallenges } from '@/actions/challenge/challenge.admin.action'
import ChallengesTable from '@/components/admin/challenges/ChallengesTable'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ChallengesPage(props: PageProps) {
  const searchParams = await props.searchParams

  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10
  const search = (searchParams.search as string) || ''
  const skip = (page - 1) * limit

  const { data, total } = await fetchChallenges(skip, limit, search)

  const t = await getTranslations('Admin.Challenges')

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

      <ChallengesTable data={data} totalItems={total} />
    </div>
  )
}
