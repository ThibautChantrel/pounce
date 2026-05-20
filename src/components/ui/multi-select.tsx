'use client'

import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type MultiSelectOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

type Props<T extends string> = {
  options: MultiSelectOption<T>[]
  selected: T[]
  onChange: (values: T[]) => void
  label: string
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function MultiSelect<T extends string>({
  options,
  selected,
  onChange,
  label,
  align = 'start',
  className,
}: Props<T>) {
  function toggle(value: T) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const hasSelection = selected.length > 0
  const singleSelected =
    selected.length === 1 ? options.find((o) => o.value === selected[0]) : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 h-auto rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
            hasSelection
              ? 'bg-primary/10 text-foreground border-primary/50 hover:border-primary hover:bg-primary/15'
              : 'bg-background/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground',
            className
          )}
        >
          {singleSelected?.icon}
          <span>
            {singleSelected
              ? singleSelected.label
              : selected.length > 1
                ? `${label} (${selected.length})`
                : label}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto min-w-40 p-1.5 space-y-0.5"
      >
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => toggle(option.value)}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm rounded-md hover:bg-accent transition-colors text-left cursor-pointer"
            >
              <div
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                  isSelected ? 'bg-primary border-primary' : 'border-border'
                )}
              >
                {isSelected && (
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                )}
              </div>
              {option.icon && (
                <span className="text-muted-foreground">{option.icon}</span>
              )}
              <span>{option.label}</span>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
