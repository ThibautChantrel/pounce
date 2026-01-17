import { getFileInfos } from '@/actions/file/file.admin.actions'
import { FileEditClient } from '@/components/admin/files/FilesEdit'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function FileEditPage(props: PageProps) {
  const params = await props.params

  const file = await getFileInfos(params.id)

  if (!file) {
    notFound()
  }

  return <FileEditClient file={file} />
}
