'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type'
import { Flag, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchChallenges } from '@/actions/challenge/challenge.action'
import { useDebounce } from 'use-debounce'
import { useTranslations } from 'next-intl'
import { ChallengeCard } from './ChallengeCard'

const ITEMS_PER_PAGE = 10

export function ChallengeCarousel() {
  const t = useTranslations('Challenges')

  // --- ÉTATS ---
  const [api, setApi] = React.useState<CarouselApi>()
  const [challenges, setChallenges] = React.useState<ChallengeWithRelations[]>(
    []
  )
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Recherche
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500)

  // --- LOGIQUE DE CHARGEMENT ---
  const loadChallenges = React.useCallback(
    async (reset = false) => {
      setIsLoading(true)
      try {
        const currentSkip = reset ? 0 : challenges.length

        const response = await fetchChallenges(
          currentSkip,
          ITEMS_PER_PAGE,
          debouncedSearch
        )

        if (reset) {
          setChallenges(response.data)
        } else {
          // Fusionne en évitant les doublons d'IDs (sécurité)
          setChallenges((prev) => {
            const newItems = response.data.filter(
              (newItem) => !prev.some((p) => p.id === newItem.id)
            )
            return [...prev, ...newItems]
          })
        }

        setTotal(response.total)
      } catch (error) {
        console.error('Erreur chargement challenges:', error)
      } finally {
        setIsLoading(false)
        setHasInitialized(true)
      }
    },
    [debouncedSearch, challenges.length]
  )

  // 1. Effet : Recherche (Reset total)
  React.useEffect(() => {
    loadChallenges(true)
    if (api) api.scrollTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // 2. Effet : Scroll Infini (Détection intelligente)
  React.useEffect(() => {
    if (!api) return

    const onScrollOrSelect = () => {
      if (isLoading || challenges.length >= total) return

      const scrollProgress = api.scrollProgress() // 0.0 à 1.0
      const selectedIndex = api.selectedScrollSnap() // Index (0, 1, 2...)

      // On charge si on dépasse 75% du scroll global OU si on est sur les 2 dernières cartes
      if (scrollProgress > 0.75 || selectedIndex >= challenges.length - 2) {
        loadChallenges(false)
      }
    }

    // On écoute 'scroll' (pendant le drag) et 'select' (à l'arrêt)
    api.on('scroll', onScrollOrSelect)
    api.on('select', onScrollOrSelect)

    return () => {
      api.off('scroll', onScrollOrSelect)
      api.off('select', onScrollOrSelect)
    }
  }, [api, isLoading, challenges.length, total, loadChallenges])

  return (
    <div className="w-full py-10 flex flex-col gap-6">
      {/* --- BARRE DE RECHERCHE --- */}
      <div className="container px-4 md:px-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-9 bg-background/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: false,
          dragFree: true, // Scroll fluide type "Netflix"
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {challenges.map((challenge) => (
            <CarouselItem
              key={challenge.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ChallengeCard challenge={challenge} />
            </CarouselItem>
          ))}

          {/* B. Squelettes (Loading next page) */}
          {isLoading &&
            hasInitialized &&
            Array.from({ length: 2 }).map((_, i) => (
              <CarouselItem
                key={`skeleton-${i}`}
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="h-[450px] w-full rounded-2xl bg-muted/20 animate-pulse" />
              </CarouselItem>
            ))}

          {/* C. Carte de Fin (Tout chargé) */}
          {!isLoading &&
            challenges.length > 0 &&
            challenges.length >= total && (
              <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="h-[450px] w-full rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 flex flex-col items-center justify-center text-center p-6 text-muted-foreground hover:bg-muted/20 transition-colors cursor-default">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Flag className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('endTitle')}</h3>
                  <p className="text-sm max-w-50">{t('endDescription')}</p>
                </div>
              </CarouselItem>
            )}

          {/* D. Pas de résultats */}
          {!isLoading && hasInitialized && challenges.length === 0 && (
            <CarouselItem className="pl-4 w-full">
              <div className="h-75 w-full flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-10 h-10 mb-4 opacity-20" />
                <p>{t('noResults')}</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        {/* Flèches de navigation Desktop */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </div>
      </Carousel>
    </div>
  )
}
