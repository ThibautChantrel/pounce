'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState, // Import nécessaire pour le typage
  OnChangeFn, // Import nécessaire pour le typage
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  Upload,
} from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslations } from 'next-intl'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalItems: number
  import?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  import: showImport,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('Admin')

  // --- 1. Gestion des paramètres d'URL existants ---
  const page = Number(searchParams.get('page')) || 1
  const per_page = Number(searchParams.get('limit')) || 10
  const search = searchParams.get('search') || ''

  // --- 2. Gestion du Tri (Parsing URL -> État Table) ---
  // On lit "?sort=role:asc,email:desc" pour le transformer en objet TanStack
  const sortParam = searchParams.get('sort')

  const sorting = React.useMemo<SortingState>(() => {
    if (!sortParam) return []

    return sortParam.split(',').map((item) => {
      const [id, order] = item.split(':')
      return {
        id,
        desc: order === 'desc',
      }
    })
  }, [sortParam])

  const pageCount = Math.ceil(totalItems / per_page)

  // --- 3. Gestionnaire de changement de Tri (État Table -> URL) ---
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    // TanStack nous donne soit la nouvelle valeur, soit une fonction de mise à jour
    const newSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    const params = new URLSearchParams(searchParams.toString())

    if (newSorting.length > 0) {
      // Transformation de l'état en chaîne : "col1:asc,col2:desc"
      const sortString = newSorting
        .map((s) => `${s.id}:${s.desc ? 'desc' : 'asc'}`)
        .join(',')

      params.set('sort', sortString)
    } else {
      // Si le tableau est vide (3ème clic), on supprime le paramètre
      params.delete('sort')
    }

    // Nettoyage des anciens paramètres si jamais ils existent encore
    params.delete('sortBy')
    params.delete('sortOrder')

    // On retourne à la page 1 quand on change le tri par précaution UX
    params.set('page', '1')

    router.push(`${pathname}?${params.toString()}`)
  }

  // --- 4. Configuration de la Table ---
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: per_page,
      },
      sorting, // Injection de l'état calculé
    },
    onSortingChange: handleSortingChange, // Injection du gestionnaire
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true, // IMPORTANT : Indique que le tri est serveur
    getCoreRowModel: getCoreRowModel(),
  })

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handleSearch = useDebouncedCallback((term: string) => {
    router.push(
      `${pathname}?${createQueryString({
        search: term || null,
        page: 1,
      })}`
    )
  }, 300)

  const handlePageChange = (newPage: number) => {
    router.push(`${pathname}?${createQueryString({ page: newPage })}`)
  }

  const handlePageSizeChange = (newSize: string) => {
    router.push(
      `${pathname}?${createQueryString({
        limit: newSize,
        page: 1,
      })}`
    )
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils (Recherche + Création) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`${pathname}/create`)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {showImport && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`${pathname}/import`)}
              >
                <Upload className="mr-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('Results.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('Results.total')} : {totalItems} résultats
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <Select value={`${per_page}`} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue placeholder={per_page} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {page} sur {pageCount}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            >
              <span className="sr-only">Première page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <span className="sr-only">Précédent</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pageCount}
            >
              <span className="sr-only">Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(pageCount)}
              disabled={page === pageCount}
            >
              <span className="sr-only">Dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
