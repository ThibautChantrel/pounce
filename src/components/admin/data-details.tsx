import { ReactNode } from 'react'
import { Check, X, Calendar } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FileData } from '@/actions/file/file.admin.actions'
import { useFormatter } from 'next-intl'
import FilePreview from '../FilePreview'

// --- TYPES ---

export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'file'
  | 'custom'

// On définit les variantes de badge possibles
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface FieldConfig<T> {
  label: string
  /**
   * Soit la clé de l'objet (ex: 'name'),
   * soit une fonction pour récupérer la valeur complexe
   */
  key?: keyof T
  // On remplace 'any' par 'unknown' pour plus de sécurité, ou ReactNode pour le retour
  getValue?: (data: T) => unknown

  type?: FieldType

  /** * Pour le type 'date'.
   * Correction: next-intl attend des options Intl, pas une string
   */
  dateFormat?: Intl.DateTimeFormatOptions

  /** Pour le type 'badge' */
  badgeVariants?: Record<string, BadgeVariant>

  /** Classe CSS pour la valeur */
  className?: string
}

interface DataDetailsProps<T> {
  data: T
  fields: FieldConfig<T>[]
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
}

// --- COMPOSANT ---

export function DataDetails<T extends Record<string, unknown>>({
  data,
  fields,
  title,
  description,
  actions,
  className,
}: DataDetailsProps<T>) {
  const format = useFormatter()

  // Fonction utilitaire pour extraire la valeur
  const resolveValue = (field: FieldConfig<T>): unknown => {
    if (field.getValue) return field.getValue(data)
    if (field.key) return data[field.key]
    return null
  }

  const renderValue = (field: FieldConfig<T>, value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Non défini</span>
    }

    switch (field.type) {
      case 'date':
        const dateValue = new Date(value as string | number | Date)

        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {format.dateTime(dateValue, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
          </div>
        )

      case 'boolean':
        return value ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 gap-1"
          >
            <Check className="w-3 h-3" /> Oui
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 gap-1"
          >
            <X className="w-3 h-3" /> Non
          </Badge>
        )

      case 'badge':
        const strValue = String(value)
        const variant = field.badgeVariants?.[strValue] || 'secondary'
        return <Badge variant={variant}>{strValue}</Badge>

      case 'file':
        const fileData = value as FileData | null
        if (!fileData || !fileData.id)
          return <span className="text-muted-foreground">Aucun fichier</span>

        return (
          <div className="w-full max-w-50 h-32">
            <FilePreview
              url={`/api/files/${fileData.id}`}
              mimeType={fileData.mimeType}
              fileName={fileData.filename}
              className="w-full h-full bg-white rounded-lg border border-slate-200 shadow-sm"
              iconClassName="text-slate-400 opacity-60"
            />
          </div>
        )

      case 'custom':
        return value as ReactNode

      case 'string':
      case 'number':
      default:
        return (
          <span className={cn('font-medium', field.className)}>
            {String(value)}
          </span>
        )
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}

      <CardContent>
        <dl className="divide-y divide-slate-100">
          {fields.map((field, index) => {
            const value = resolveValue(field)

            return (
              <div
                key={`${field.label}-${index}`}
                className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-3 sm:gap-4"
              >
                <dt className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="text-sm text-slate-900 sm:col-span-2 flex items-center">
                  {renderValue(field, value)}
                </dd>
              </div>
            )
          })}
        </dl>
      </CardContent>
    </Card>
  )
}
