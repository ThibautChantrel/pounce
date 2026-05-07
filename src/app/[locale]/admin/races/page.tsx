import { adminListRacesAction } from '@/actions/race/race.admin.actions'
import { parseTableParams } from '@/utils/fetch'
import { RacesAdminTable } from '@/components/race/admin/RacesAdminTable'
import { RaceStatus } from '@prisma/client'
import { getTranslations } from 'next-intl/server'
import type { RaceColumn } from '@/admin/race.columns'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminRacesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const params = parseTableParams(raw)
  const status = raw.status as RaceStatus | undefined
  const t = await getTranslations('Admin.Races')

  const { data, total } = await adminListRacesAction({ ...params, status })

  const tableData: RaceColumn[] = data.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    format: r.format,
    organizerName:
      [r.organizer.firstName, r.organizer.lastName].filter(Boolean).join(' ') ||
      r.organizer.pseudo ||
      '—',
    trackTitle: r.track.title,
    startAt: r.startAt,
    registrationCount: r.registrationCount,
  }))

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description', { count: total })}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/races/create">
            <Plus className="w-4 h-4 mr-1.5" />
            Créer une course
          </Link>
        </Button>
      </div>
      <RacesAdminTable data={tableData} totalItems={total} />
    </div>
  )
}
