'use client'

import { DataTable } from '@/components/admin/data-table'
import {
  StravaSyncColumn,
  useStravaSyncColumns,
} from '@/admin/strava-sync.columns'

export default function StravaSyncsTable({
  data,
  totalItems,
}: {
  data: StravaSyncColumn[]
  totalItems: number
}) {
  const columns = useStravaSyncColumns()
  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
