import { Link } from '@/navigation'
import { Instagram } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const year = new Date().getFullYear()
  const t = useTranslations('Footer')

  return (
    <footer className="mt-20 border-t border-border/40 bg-muted/20">
      <div className="container max-w-5xl mx-auto px-6 py-10">
        {/* Conteneur principal (Côte à côte sur Desktop, empilé sur Mobile) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* GAUCHE : Branding & Manifeste */}
          <div className="max-w-xs space-y-3">
            <div className="text-xs tracking-[0.2em] font-bold text-foreground">
              POUNCE
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* DROITE : Liens & Réseaux */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm">
            <div className="flex flex-col space-y-3 font-medium">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('about')}
              </Link>
              <Link
                href="/feedback"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('feedback')}
              </Link>
            </div>

            <div className="flex flex-col space-y-3 font-medium">
              <a
                href="https://www.instagram.com/thibautboulotdodo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>{t('instagram')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM : Copyright */}
        <div className="mt-10 pt-6 border-t border-border/40 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© {year} Pounce</span>
          <span>{t('footprint')}</span>
        </div>
      </div>
    </footer>
  )
}
