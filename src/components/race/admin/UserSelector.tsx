'use client'

import { useEffect, useRef, useState } from 'react'
import { User, Search, X, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { adminSearchUsersAction } from '@/actions/race/race.admin.actions'

export type UserSelectorValue = {
  userId: string
  name: string
  email: string
} | null

type UserResult = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  pseudo: string | null
}

type Props = {
  value: UserSelectorValue
  onChange: (v: UserSelectorValue) => void
  placeholder?: string
}

export function UserSelector({
  value,
  onChange,
  placeholder = 'Rechercher un utilisateur…',
}: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await adminSearchUsersAction(query)
        setResults(res)
        setOpen(true)
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  function selectUser(u: UserResult) {
    const name =
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.pseudo || u.email
    onChange({ userId: u.id, name, email: u.email })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  function clearSelection() {
    onChange(null)
    setQuery('')
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{value.name}</p>
          <p className="text-xs text-muted-foreground">{value.email}</p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {searching && (
            <p className="text-xs text-muted-foreground px-4 py-3">
              Recherche…
            </p>
          )}
          {!searching && results.length === 0 && (
            <p className="text-xs text-muted-foreground px-4 py-3">
              Aucun utilisateur trouvé
            </p>
          )}
          {!searching &&
            results.map((u) => {
              const name =
                `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
                u.pseudo ||
                u.email
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectUser(u)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}
