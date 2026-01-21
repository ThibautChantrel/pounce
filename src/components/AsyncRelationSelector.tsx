'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from 'use-debounce'

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type RelationItem = {
  id: string
  name: string
}

export type FetchRelationParams = {
  skip: number
  take: number
  search?: string
}

export type FetchRelationResponse = {
  data: RelationItem[]
  total: number
}

interface AsyncRelationSelectorProps {
  value?: string | string[] | null
  onChange: (value: string | string[] | null) => void
  fetchFunction: (params: FetchRelationParams) => Promise<FetchRelationResponse>
  mode?: 'single' | 'multiple'
  label?: string
  initialData?: RelationItem[]
  placeholder?: string
  take?: number
  // 👇 NOUVELLE PROP : Pour afficher les numéros (1, 2, 3...)
  ordered?: boolean
}

export function AsyncRelationSelector({
  value,
  onChange,
  fetchFunction,
  mode = 'single',
  initialData = [],
  placeholder = 'Sélectionner...',
  take = 5,
  ordered = false, // Par défaut désactivé
}: AsyncRelationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // État des données
  const [items, setItems] = useState<RelationItem[]>([])
  const [total, setTotal] = useState(0)

  // État de recherche et pagination
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [page, setPage] = useState(0)

  // Cache des noms pour l'affichage
  const [selectedItemsMap, setSelectedItemsMap] = useState<Map<string, string>>(
    new Map(initialData.map((i) => [i.id, i.name]))
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchFunction({
        skip: page * take,
        take,
        search: debouncedSearch || undefined,
      })
      setItems(res.data)
      setTotal(res.total)
    } catch (error) {
      console.error('Erreur loading relations', error)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, page, take, debouncedSearch])

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const isSelected = (id: string) => {
    if (Array.isArray(value)) return value.includes(id)
    return value === id
  }

  const handleSelect = (item: RelationItem) => {
    const newMap = new Map(selectedItemsMap)
    newMap.set(item.id, item.name)
    setSelectedItemsMap(newMap)

    if (mode === 'single') {
      if (value === item.id) onChange(null)
      else onChange(item.id)
      setOpen(false)
    } else {
      const currentArray = Array.isArray(value) ? value : []
      if (currentArray.includes(item.id)) {
        onChange(currentArray.filter((id) => id !== item.id))
      } else {
        // Ajoute à la fin, préservant ainsi l'ordre de sélection
        onChange([...currentArray, item.id])
      }
    }
  }

  const removeValue = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (Array.isArray(value)) {
      onChange(value.filter((id) => id !== idToRemove))
    }
  }

  // --- RENDU MODIFIÉ POUR SUPPORTER LE MODE "ORDERED" ---
  const renderTriggerContent = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    if (mode === 'single') {
      const id = value as string
      const name = selectedItemsMap.get(id) || id
      return <span className="truncate">{name}</span>
    }

    // Mode multiple
    const ids = value as string[]

    // Si mode ordered, on affiche une liste verticale pour bien voir la séquence
    if (ordered) {
      return (
        <div className="flex flex-col gap-1 w-full my-1">
          {ids.map((id, index) => (
            <div
              key={id}
              className="flex items-center justify-between bg-secondary/50 p-1.5 rounded-md text-sm group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Badge
                  variant="outline"
                  className="bg-background h-5 w-5 flex items-center justify-center p-0 shrink-0"
                >
                  {index + 1}
                </Badge>
                <span className="truncate font-medium">
                  {selectedItemsMap.get(id) || id}
                </span>
              </div>
              <X
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => removeValue(id, e)}
              />
            </div>
          ))}
        </div>
      )
    }

    // Affichage classique (Tags)
    return (
      <div className="flex flex-wrap gap-1">
        {ids.map((id) => (
          <Badge key={id} variant="secondary" className="mr-1">
            {selectedItemsMap.get(id) || id}
            <X
              className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={(e) => removeValue(id, e)}
            />
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between px-3 py-2',
            // Ajustement hauteur auto si liste verticale
            ordered && Array.isArray(value) && value.length > 0
              ? 'h-auto'
              : 'h-10'
          )}
        >
          <div className="flex flex-1 text-left items-center overflow-hidden">
            {renderTriggerContent()}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="p-2 border-b flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="border-none shadow-none h-8 focus-visible:ring-0 px-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[200px] overflow-y-auto p-1">
          {loading && items.length === 0 && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Chargement...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun résultat.
            </div>
          )}

          {items.map((item) => {
            const isSel = isSelected(item.id)
            // Calcul de l'index si sélectionné (pour afficher le numéro dans la liste déroulante aussi)
            const index = Array.isArray(value) ? value.indexOf(item.id) : -1

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  'flex items-center px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground',
                  isSel && 'bg-accent/50'
                )}
              >
                <div
                  className={cn(
                    'mr-2 flex items-center justify-center w-4 h-4',
                    isSel ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  {ordered && isSel ? (
                    <span className="text-xs font-bold">{index + 1}</span>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-2 border-t flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <span>{total} total</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="flex items-center px-1">
              {page + 1} / {Math.max(1, Math.ceil(total / take))}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={(page + 1) * take >= total || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
