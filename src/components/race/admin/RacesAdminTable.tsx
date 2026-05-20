'use client'

import { DataTable } from '@/components/admin/data-table'
import { RaceColumn, useRaceColumns } from '@/admin/race.columns'

interface RacesAdminTableProps {
  data: RaceColumn[]
  totalItems: number
}

export function RacesAdminTable({ data, totalItems }: RacesAdminTableProps) {
  const columns = useRaceColumns()
  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
