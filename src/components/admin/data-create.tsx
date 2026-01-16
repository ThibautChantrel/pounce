'use client'

import { useState } from 'react'
import {
  useForm,
  DefaultValues,
  Path,
  ControllerRenderProps,
  Control,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import FileUpload from '../FileUpload'

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'date'
  | 'boolean'
  | 'select'
  | 'file'

export interface SelectOption {
  label: string
  value: string
}

export interface CreateFieldConfig<T> {
  name: Path<T>
  label: string
  type?: FieldType
  description?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  options?: SelectOption[]
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataCreateProps<TSchema extends z.ZodObject<any>> {
  schema: TSchema
  defaultValues: DefaultValues<z.input<TSchema>>
  fields: CreateFieldConfig<z.input<TSchema>>[]
  onSubmit: (values: z.output<TSchema>) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  className?: string
}

function toLocalDatetimeInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 16)
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataCreate<TSchema extends z.ZodObject<any>>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  onCancel,
  submitLabel,
  className,
}: DataCreateProps<TSchema>) {
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('Admin')

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<z.input<TSchema>, any, z.output<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function handleSubmitInternal(values: z.output<TSchema>) {
    setIsLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setIsLoading(false)
    }
  }

  const renderInput = (
    fieldConfig: CreateFieldConfig<z.input<TSchema>>,
    field: ControllerRenderProps<z.input<TSchema>, Path<z.input<TSchema>>>
  ) => {
    const isDisabled = fieldConfig.disabled || isLoading

    switch (fieldConfig.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={isDisabled}
          />
        )

      case 'textarea': {
        const value = typeof field.value === 'string' ? field.value : ''
        return (
          <Textarea
            name={field.name}
            ref={field.ref}
            placeholder={fieldConfig.placeholder}
            className="min-h-25"
            disabled={isDisabled}
            value={value}
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )
      }

      case 'select': {
        const value = typeof field.value === 'string' ? field.value : undefined
        return (
          <Select
            value={value}
            onValueChange={(v) => field.onChange(v)}
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={fieldConfig.placeholder || 'Sélectionner'}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {fieldConfig.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      case 'date': {
        const value = typeof field.value === 'string' ? field.value : null
        return (
          <Input
            type="datetime-local"
            disabled={isDisabled}
            value={toLocalDatetimeInput(value)}
            onChange={(e) =>
              field.onChange(
                e.target.value ? new Date(e.target.value).toISOString() : null
              )
            }
          />
        )
      }

      case 'file':
        return (
          <div className="w-full max-w-lg mx-auto">
            <FileUpload
              value={field.value as File | null}
              onChange={field.onChange}
              disabled={isDisabled}
            />
          </div>
        )

      case 'number': {
        const value =
          typeof field.value === 'number' || typeof field.value === 'string'
            ? field.value
            : ''
        return (
          <Input
            type="number"
            disabled={isDisabled}
            value={value}
            onChange={(e) => {
              const v = e.target.valueAsNumber
              field.onChange(Number.isNaN(v) ? null : v)
            }}
          />
        )
      }

      default: {
        const value =
          typeof field.value === 'string' || typeof field.value === 'number'
            ? field.value
            : ''
        return (
          <Input
            type={fieldConfig.type || 'text'}
            placeholder={fieldConfig.placeholder}
            disabled={isDisabled}
            name={field.name}
            ref={field.ref}
            value={value}
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.value)}
          />
        )
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitInternal)}
        className={cn('space-y-6', className)}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((fieldConfig) => (
            <FormField
              key={String(fieldConfig.name)}
              control={form.control as unknown as Control<z.input<TSchema>>}
              name={fieldConfig.name}
              render={({ field }) => (
                <FormItem
                  className={cn(
                    fieldConfig.className,
                    fieldConfig.type === 'file' &&
                      'col-span-1 md:col-span-2 flex flex-col items-center justify-center w-full'
                  )}
                >
                  <FormLabel>{fieldConfig.label}</FormLabel>
                  <FormControl>{renderInput(fieldConfig, field)}</FormControl>
                  {fieldConfig.description && (
                    <FormDescription>{fieldConfig.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t justify-center md:justify-start">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {submitLabel || t('Actions.create') || 'Créer'}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {t('Actions.cancel')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
