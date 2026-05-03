import { auth } from '@/server/modules/auth/auth.config'
import { notFound } from 'next/navigation'
import { RaceForm } from '@/components/race/RaceForm'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/navigation'

export default async function CreateRacePage() {
  const session = await auth()
  if (!session?.user?.id) notFound()

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
        <h1 className="text-2xl font-bold text-foreground">Créer une course</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {session.user.role === 'ADMIN'
            ? "En tant qu'admin, ta course sera publiée directement."
            : "Ta course sera soumise à validation avant d'être publiée."}
        </p>
      </div>
      <RaceForm />
    </div>
  )
}
