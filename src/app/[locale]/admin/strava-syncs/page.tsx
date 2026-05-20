import { fetchStravaSyncs } from '@/actions/strava-sync/strava-sync.admin.actions'
import StravaSyncsTable from '@/components/admin/strava-syncs/StravaSyncsTable'
import { parseTableParams } from '@/utils/fetch'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StravaSyncsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams
  const params = parseTableParams(rawParams)
  const { data, total } = await fetchStravaSyncs(params)
  const t = await getTranslations('Admin.StravaSyncs')

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description', { count: total })}
          </p>
        </div>
      </div>
      <StravaSyncsTable data={data} totalItems={total} />
    </div>
  )
}
