'use client'

import { TrackColumn, useTrackColumns } from '@/admin/track.columns'
import { DataTable } from '@/components/admin/data-table'

interface UsersTableProps {
  data: TrackColumn[]
  totalItems: number
}

export default function TracksTable({ data, totalItems }: UsersTableProps) {
  const columns = useTrackColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
