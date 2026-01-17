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
import { useFormatter } from 'next-intl'
import FileDetails from '../FileDetails'
import { FileData } from '@/actions/file/file.admin.type'

export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'file'
  | 'file-list'
  | 'custom'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export interface FieldConfig<T> {
  label: string
  key?: keyof T
  getValue?: (data: T) => unknown
  type?: FieldType
  dateFormat?: Intl.DateTimeFormatOptions
  badgeVariants?: Record<string, BadgeVariant>
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

export function DataDetails<T extends Record<string, unknown>>({
  data,
  fields,
  title,
  description,
  actions,
  className,
}: DataDetailsProps<T>) {
  const format = useFormatter()

  // 2. MODIFICATION DU FILTRE : On inclut 'file-list' avec les fichiers pour l'affichage en bas
  const fileFields = fields.filter(
    (f) => f.type === 'file' || f.type === 'file-list'
  )
  const standardFields = fields.filter(
    (f) => f.type !== 'file' && f.type !== 'file-list'
  )

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
                hour: '2-digit',
                minute: '2-digit',
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

        return <FileDetails file={fileData} />

      case 'file-list':
        const filesList = value as FileData[] | null
        if (!filesList || !Array.isArray(filesList) || filesList.length === 0)
          return <span className="text-muted-foreground">Aucun fichier</span>

        return (
          <div className="flex flex-col gap-6 w-full items-center">
            {filesList.map((fileItem) => {
              if (!fileItem || !fileItem.id) return null
              return (
                <div key={fileItem.id} className="w-full flex justify-center">
                  <FileDetails file={fileItem} />
                </div>
              )
            })}
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
        {standardFields.length > 0 && (
          <dl className="divide-y divide-slate-100">
            {standardFields.map((field, index) => {
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
        )}

        {fileFields.length > 0 && (
          <div
            className={cn(
              'space-y-8',
              standardFields.length > 0 && 'mt-8 pt-8 border-t'
            )}
          >
            {fileFields.map((field, index) => {
              const value = resolveValue(field)
              return (
                <div
                  key={`${field.label}-file-${index}`}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <div className="mb-3 text-sm font-medium text-muted-foreground text-center">
                    {field.label}
                  </div>

                  <div className="flex justify-center w-full">
                    {renderValue(field, value)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
