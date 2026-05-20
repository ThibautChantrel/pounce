'use client'

import { DataTable } from '@/components/admin/data-table'
import {
  ChallengeCertificationColumn,
  useChallengeCertificationColumns,
} from '@/admin/challenge-certification.columns'

export default function ChallengeCertificationsTable({
  data,
  totalItems,
}: {
  data: ChallengeCertificationColumn[]
  totalItems: number
}) {
  const columns = useChallengeCertificationColumns()
  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
