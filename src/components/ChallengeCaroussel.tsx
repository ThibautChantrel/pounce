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
import { ChallengeCard } from './ChallengeCard'
import { ChallengeWithRelations } from '@/actions/challenge/challenge.admin.type'
import { Flag, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchChallenges } from '@/actions/challenge/challenge.action' // Ton action serveur
import { useDebounce } from 'use-debounce' // Assure-toi d'avoir installé ce package ou utilise un hook maison

const ITEMS_PER_PAGE = 10

export function ChallengeCarousel() {
  // --- ÉTATS ---
  const [api, setApi] = React.useState<CarouselApi>()
  const [challenges, setChallenges] = React.useState<ChallengeWithRelations[]>(
    []
  )
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasInitialized, setHasInitialized] = React.useState(false)

  // Gestion de la recherche
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 500) // Délai de 500ms

  // --- LOGIQUE DE CHARGEMENT ---

  /**
   * Charge les challenges.
   * @param reset Si true, efface la liste actuelle (cas d'une nouvelle recherche)
   */
  const loadChallenges = React.useCallback(
    async (reset = false) => {
      setIsLoading(true)
      try {
        // Si on reset, on commence à 0, sinon on saute ce qu'on a déjà chargé
        // Note: On utilise challenges.length de la closure ou on passe un argument,
        // ici pour simplifier dans le useEffect on gérera le skip dynamiquement
        const currentSkip = reset ? 0 : challenges.length

        const response = await fetchChallenges(
          currentSkip,
          ITEMS_PER_PAGE,
          debouncedSearch
        )

        if (reset) {
          setChallenges(response.data)
        } else {
          // On ajoute les nouveaux à la suite (en évitant les doublons potentiels par sécurité)
          setChallenges((prev) => [...prev, ...response.data])
        }

        setTotal(response.total)
      } catch (error) {
        console.error('Erreur lors du chargement des challenges', error)
      } finally {
        setIsLoading(false)
        setHasInitialized(true)
      }
    },
    [debouncedSearch, challenges.length]
  )

  // 1. Effet : Recherche (Reset la liste quand le terme change)
  React.useEffect(() => {
    loadChallenges(true)
    // On revient au début du caroussel si une recherche est faite
    if (api) api.scrollTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]) // On ne dépend que du terme de recherche ici

  // 2. Effet : Pagination Infinie via l'API du Carousel
  React.useEffect(() => {
    if (!api) return

    const onSelect = () => {
      // Si on charge déjà ou qu'on a tout chargé, on ne fait rien
      if (isLoading || challenges.length >= total) return

      // Vérifie si on est proche de la fin (ex: 2 slides avant la fin)
      const selectedIndex = api.selectedScrollSnap()
      const scrollProgress = api.scrollProgress()

      // Si on a dépassé 70% du scroll ou qu'on est sur les derniers slides
      if (selectedIndex >= challenges.length - 3) {
        loadChallenges(false) // On charge la suite
      }
    }

    api.on('select', onSelect)

    return () => {
      api.off('select', onSelect)
    }
  }, [api, isLoading, challenges.length, total, loadChallenges])

  return (
    <div className="w-full py-10 flex flex-col gap-6">
      {/* --- BARRE DE RECHERCHE --- */}
      <div className="container px-4 md:px-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un challenge, un lieu..."
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

      {/* --- CAROUSEL --- */}
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: false,
          dragFree: true, // Fluidifie le scroll pour l'effet "infini"
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {/* A. Les Challenges chargés */}
          {challenges.map((challenge) => (
            <CarouselItem
              key={challenge.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ChallengeCard challenge={challenge} />
            </CarouselItem>
          ))}

          {/* B. Squelettes de chargement (Si on charge la suite) */}
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

          {/* C. Carte de Fin (Seulement si on a tout chargé et qu'il y a des résultats) */}
          {!isLoading &&
            challenges.length > 0 &&
            challenges.length >= total && (
              <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="h-[450px] w-full rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 flex flex-col items-center justify-center text-center p-6 text-muted-foreground hover:bg-muted/20 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Flag className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    C est tout pour le moment !
                  </h3>
                  <p className="text-sm max-w-50">
                    D autres challenges légendaires arrivent bientôt à Paris.
                  </p>
                </div>
              </CarouselItem>
            )}

          {/* D. Pas de résultats */}
          {!isLoading && hasInitialized && challenges.length === 0 && (
            <CarouselItem className="pl-4 w-full">
              <div className="h-50 w-full flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-10 h-10 mb-4 opacity-20" />
                <p>Aucun challenge ne correspond à votre recherche.</p>
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
