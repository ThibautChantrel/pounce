import { fetchTrackCertifications } from '@/actions/certification/certification.admin.actions'
import TrackCertificationsTable from '@/components/admin/certifications/TrackCertificationsTable'
import { parseTableParams } from '@/utils/fetch'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TrackCertificationsPage({
  searchParams,
}: PageProps) {
  const rawParams = await searchParams
  const params = parseTableParams(rawParams)
  const { data, total } = await fetchTrackCertifications(params)
  const t = await getTranslations('Admin.Certifications')

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('trackTitle')}
          </h2>
          <p className="text-muted-foreground">
            {t('description', { count: total })}
          </p>
        </div>
      </div>
      <TrackCertificationsTable data={data} totalItems={total} />
    </div>
  )
}
