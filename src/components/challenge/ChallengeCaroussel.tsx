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
import { Flag, Search, Loader2, PawPrint } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchChallenges } from '@/actions/challenge/challenge.action'
import { useDebounce } from 'use-debounce'
import { useTranslations } from 'next-intl'
import { ChallengeCard } from './ChallengeCard'

const ITEMS_PER_PAGE = 10

export function ChallengeCarousel() {
  const t = useTranslations('Challenges')

  const [api, setApi] = React.useState<CarouselApi>()
  const [challenges, setChallenges] = React.useState<ChallengeWithRelations[]>(
    []
  )
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasInitialized, setHasInitialized] = React.useState(false)

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500)

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

  React.useEffect(() => {
    loadChallenges(true)
    if (api) api.scrollTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // 2. Effet : Scroll Infini
  React.useEffect(() => {
    if (!api) return

    const onScrollOrSelect = () => {
      if (isLoading || challenges.length >= total) return

      const scrollProgress = api.scrollProgress()
      const selectedIndex = api.selectedScrollSnap()

      if (scrollProgress > 0.75 || selectedIndex >= challenges.length - 2) {
        loadChallenges(false)
      }
    }

    api.on('scroll', onScrollOrSelect)
    api.on('select', onScrollOrSelect)

    return () => {
      api.off('scroll', onScrollOrSelect)
      api.off('select', onScrollOrSelect)
    }
  }, [api, isLoading, challenges.length, total, loadChallenges])

  return (
    <div className="w-full py-4 flex flex-col gap-8">
      <div className="container px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 text-canopy">
            <div className="p-2 bg-canopy/10 rounded-full">
              <PawPrint className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Marquez votre empreinte
            </h2>
          </div>

          <div className="relative w-full md:w-72 lg:w-96">
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-9 bg-background/50 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Spinner à droite */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CAROUSEL --- */}
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: false,
          dragFree: true,
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

          {/* Squelettes de chargement */}
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

          {/* Carte de Fin */}
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

          {/* Pas de résultats */}
          {!isLoading && hasInitialized && challenges.length === 0 && (
            <CarouselItem className="pl-4 w-full">
              <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-10 h-10 mb-4 opacity-20" />
                <p>{t('noResults')}</p>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        <div className="hidden md:block">
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </div>
      </Carousel>
    </div>
  )
}
