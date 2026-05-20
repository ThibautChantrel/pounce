'use client'

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Input } from './input'

export type TabOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
  count?: number
}

export type FilterOption<T extends string> = {
  value: T
  label: string
  icon?: React.ReactNode
}

type Props<TTab extends string, TFilter extends string> = {
  tabs: TabOption<TTab>[]
  activeTab: TTab
  onTabChange: (tab: TTab) => void
  filters: FilterOption<TFilter>[]
  activeFilter: TFilter
  onFilterChange: (filter: TFilter) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  summary?: string
}

export function FilterBar<TTab extends string, TFilter extends string>({
  tabs,
  activeTab,
  onTabChange,
  filters,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  searchPlaceholder,
  summary,
}: Props<TTab, TFilter>) {
  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-full p-1 flex">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 h-auto cursor-pointer',
                activeTab === tab.value
                  ? 'bg-card text-foreground shadow-sm hover:bg-card hover:text-foreground'
                  : 'text-muted-foreground hover:bg-transparent hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[11px] tabular-nums opacity-60">
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary phrase */}
      {summary && (
        <p className="text-center text-muted-foreground text-sm">{summary}</p>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 bg-background/50 backdrop-blur-sm"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              onClick={() => onFilterChange(f.value)}
              className={cn(
                'h-auto rounded-full border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer',
                activeFilter === f.value
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                  : 'bg-background/50 text-muted-foreground border-border hover:bg-background/50 hover:border-primary/50 hover:text-foreground'
              )}
            >
              {f.icon}
              {f.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
