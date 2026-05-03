import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { getRaceAction } from '@/actions/race/race.actions'
import { RaceForm } from '@/components/race/RaceForm'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/navigation'

type PageProps = { params: Promise<{ id: string }> }

export default async function ManageRacePage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) notFound()

  const race = await getRaceAction(id)
  if (!race) notFound()

  const isOwner = race.organizer.id === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isOwner && !isAdmin) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link
          href="/profile/races"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes courses
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Modifier la course
        </h1>
        <p className="text-sm text-muted-foreground mt-1 truncate">
          {race.title}
        </p>
      </div>
      <RaceForm defaultValues={race} />
    </div>
  )
}
