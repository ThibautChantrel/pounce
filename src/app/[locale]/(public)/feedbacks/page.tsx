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
    <main className="min-h-screen dark:bg-black py-12 md:py-20 px-4">
      <div className="container max-w-4xl mx-auto space-y-16">
        {/* ABOUT CTA */}
        <section className="border rounded-2xl p-8 bg-muted/30 text-center space-y-4">
          <h3 className="text-xl font-semibold">{t('aboutCta.title')}</h3>

          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('aboutCta.description')}
          </p>

          <Link
            href="/about"
            className="inline-block text-sm font-medium underline underline-offset-4 hover:opacity-70 transition"
          >
            {t('aboutCta.button')}
          </Link>
        </section>

        {/* HEADER */}
        <FeedbackHeader title={t('title')} description={t('description')} />

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
