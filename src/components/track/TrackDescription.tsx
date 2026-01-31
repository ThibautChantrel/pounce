import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function TrackDescription({ description }: { description?: string }) {
  const t = useTranslations('Tracks')
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h3 className="flex items-center gap-2 text-xl font-bold text-primary">
        <Info className="w-5 h-5" /> {t('about')}
      </h3>
      <p className="whitespace-pre-wrap text-muted-foreground">
        {description || 'Aucune description pour ce parcours.'}
      </p>
    </div>
  )
}
