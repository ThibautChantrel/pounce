'use client'

import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { Link } from '@/navigation'
import { Pen } from 'lucide-react'

export function EditButton() {
  const params = useParams<{ id: string }>()

  if (!params?.id) return null

  return (
    <Link href={`${params.id}/edit`}>
      <Button variant="outline" size="icon" className="h-8 w-8">
        <Pen className="h-4 w-4" />
      </Button>
    </Link>
  )
}
