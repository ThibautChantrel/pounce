import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { listMyRacesAction } from '@/actions/race/race.actions'
import { OrganizerRacesDashboard } from '@/components/race/OrganizerRacesDashboard'
import { Link } from '@/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function OrganizerRacesPage() {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const races = await listMyRacesAction()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Profil
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Mes courses organisées
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {races.length} course{races.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/races/create">+ Nouvelle course</Link>
        </Button>
      </div>

      <OrganizerRacesDashboard races={races} />
    </div>
  )
}
