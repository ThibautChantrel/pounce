import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { RaceForm } from '@/components/race/RaceForm'

export default function AdminCreateRacePage() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b">
        <Link href="/admin/races">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
            Admin · Courses
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Créer une course
          </h1>
        </div>
      </div>

      <RaceForm adminMode />
    </div>
  )
}
