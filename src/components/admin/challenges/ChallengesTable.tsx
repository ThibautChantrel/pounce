'use client'

import { ChallengeColumn, useChallengeColumns } from '@/admin/challenge.columns'
import { DataTable } from '@/components/admin/data-table'

interface ChallengeTableProps {
  data: ChallengeColumn[]
  totalItems: number
}

export default function ChallengesTable({
  data,
  totalItems,
}: ChallengeTableProps) {
  const columns = useChallengeColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
