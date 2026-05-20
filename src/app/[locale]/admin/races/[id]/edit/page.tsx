import { notFound } from 'next/navigation'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { getRaceAction } from '@/actions/race/race.actions'
import { RaceForm } from '@/components/race/RaceForm'

type PageProps = { params: Promise<{ id: string }> }

export default async function AdminEditRacePage({ params }: PageProps) {
  const { id } = await params
  const race = await getRaceAction(id)
  if (!race) notFound()

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b">
        <Link href={`/admin/races/${id}`}>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
            Admin · Modifier la course
          </p>
          <h1 className="text-2xl font-bold tracking-tight truncate max-w-xl">
            {race.title}
          </h1>
        </div>
      </div>

      <RaceForm defaultValues={race} adminMode />
    </div>
  )
}
