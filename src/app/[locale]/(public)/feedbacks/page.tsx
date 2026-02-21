import { getTranslations } from 'next-intl/server'
import { FeedbackHeader } from '@/components/feedback/FeedbackHeader'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'

export const metadata = {
  title: 'Contact & Feedback | Pounce',
  description: 'Envoyez-nous vos retours et aidez-nous à améliorer Pounce.',
}

export default async function FeedbackPage() {
  const t = await getTranslations('Feedbacks')

  return (
    <main className="min-h-screen dark:bg-black py-4 md:py-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <FeedbackHeader title={t('title')} description={t('description')} />

        <FeedbackForm />
      </div>
    </main>
  )
}
