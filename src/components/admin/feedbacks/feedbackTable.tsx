'use client'

import { FeedbackColumn, useFeedbackColumns } from '@/admin/feedback.column'
import { DataTable } from '@/components/admin/data-table'

interface FeedbacksTableProps {
  data: FeedbackColumn[]
  totalItems: number
}

export default function FeedbacksTable({
  data,
  totalItems,
}: FeedbacksTableProps) {
  const columns = useFeedbackColumns()

  return <DataTable columns={columns} data={data} totalItems={totalItems} />
}
