'use client'

import { DataTable } from '@/components/admin/data-table'
import {
  TrackCertificationColumn,
  useTrackCertificationColumns,
} from '@/admin/track-certification.columns'

export default function TrackCertificationsTable({
  data,
  totalItems,
}: {
  data: TrackCertificationColumn[]
  totalItems: number
}) {
  const columns = useTrackCertificationColumns()
  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
