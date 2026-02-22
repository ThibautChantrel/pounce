import { fetchFeedbacks } from '@/actions/feedback/feedback.admin.action'
import FeedbacksTable from '@/components/admin/feedbacks/feedbackTable'
import { parseTableParams } from '@/utils/fetch'
import { getTranslations } from 'next-intl/server'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FeedbacksPage({ searchParams }: PageProps) {
  const rawParams = await searchParams

  const params = parseTableParams(rawParams)

  const { data, total } = await fetchFeedbacks(params)

  const t = await getTranslations('Admin.Feedbacks')

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

      <FeedbacksTable data={data} totalItems={total} />
    </div>
  )
}
