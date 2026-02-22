import { notFound } from 'next/navigation'
import ShowLayout from '@/components/admin/ShowLayout'
import { Badge } from '@/components/ui/badge'
import { DataDetails, FieldConfig } from '@/components/admin/data-details'
import { getTranslations } from 'next-intl/server'
import { getFeedbackAction } from '@/actions/feedback/feedback.admin.action'
import { Feedback } from '@/actions/feedback/feedback.admin.types'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function FeedbackShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin.Feedbacks')

  const feedback = await getFeedbackAction(params.id)

  if (!feedback) {
    notFound()
  }

  const feedbackFields: FieldConfig<Feedback>[] = [
    {
      label: t('email'),
      key: 'email',
      className: 'font-semibold text-lg',
    },
    {
      label: t('message'),
      key: 'message',
      type: 'custom',
      getValue: (f: Feedback) => (
        <p className="text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">
          {f.message || '-'}
        </p>
      ),
    },
    {
      label: t('isRead'),
      key: 'isRead',
      type: 'custom',
      getValue: (f: Feedback) => (
        <Badge variant={f.isRead ? 'default' : 'secondary'}>
          {f.isRead ? t('read') : t('unread')}
        </Badge>
      ),
    },
    {
      label: t('subscribeToUpdates'),
      key: 'subscribeToUpdates',
      type: 'custom',
      getValue: (f: Feedback) => (
        <Badge
          variant={f.subscribeToUpdates ? 'default' : 'outline'}
          className={
            f.subscribeToUpdates
              ? 'bg-green-600/20 text-green-700 hover:bg-green-600/30 border-green-600/30'
              : ''
          }
        >
          {f.subscribeToUpdates ? t('subscribedYes') : t('subscribedNo')}
        </Badge>
      ),
    },
    {
      label: t('createdAt'),
      key: 'createdAt',
      type: 'date',
    },
  ]

  return (
    <ShowLayout module="feedbacks">
      <div className="space-y-6">
        <DataDetails
          title={t('title')}
          description={`ID: ${feedback.id}`}
          data={feedback}
          fields={feedbackFields}
        />
      </div>
    </ShowLayout>
  )
}
