import { notFound } from 'next/navigation'
import { getRaceAction } from '@/actions/race/race.actions'
import { RaceAdminDetail } from '@/components/race/admin/RaceAdminDetail'

type PageProps = { params: Promise<{ id: string }> }

export default async function AdminRaceDetailPage({ params }: PageProps) {
  const { id } = await params
  const race = await getRaceAction(id)
  if (!race) notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <RaceAdminDetail race={race} />
    </div>
  )
}
