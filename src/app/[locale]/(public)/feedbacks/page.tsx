import { getTranslations } from 'next-intl/server'
import { FeedbackHeader } from '@/components/feedback/FeedbackHeader'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { Link } from '@/navigation'

export const metadata = {
  title: 'Contact & Feedback | Pounce',
  description: 'Envoyez-nous vos retours et aidez-nous à améliorer Pounce.',
}

export default async function FeedbackPage() {
  const t = await getTranslations('Feedbacks')

  return (
    <main className="min-h-screen dark:bg-black py-16 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <FeedbackHeader title={t('title')} description={t('description')} />

        {/* MICRO CONTEXT */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {t('visionReminder')}
          </p>

          <Link
            href="/about"
            className="text-xs uppercase tracking-widest text-primary hover:text-foreground transition"
          >
            {t('learnMore')} →
          </Link>
        </div>

        {/* FORM */}
        <FeedbackForm />

        {/* AFTER FORM NOTE */}
        <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          {t('afterSubmitNote')}
        </div>
      </div>
    </main>
  )
}
