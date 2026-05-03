import { adminListRacesAction } from '@/actions/race/race.admin.actions'
import { parseTableParams } from '@/utils/fetch'
import { RacesAdminTable } from '@/components/race/admin/RacesAdminTable'
import { RaceStatus } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminRacesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const params = parseTableParams(raw)
  const status = raw.status as RaceStatus | undefined

  const { data, total } = await adminListRacesAction({ ...params, status })

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
          <p className="text-muted-foreground">
            {total} course{total !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>
      <RacesAdminTable data={data} totalItems={total} />
    </div>
  )
}
