import { notFound } from 'next/navigation'
import { getFile } from '@/actions/file/file.admin.actions'
import FileDetails from '@/components/FileDetails'
import ShowLayout from '@/components/admin/ShowLayout'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function FileShowPage(props: PageProps) {
  const params = await props.params

  const file = await getFile(params.id)

  if (!file) {
    notFound()
  }

  return (
    <ShowLayout module="files">
      <div className="space-y-6">
        <FileDetails file={file} />
      </div>
    </ShowLayout>
  )
}
