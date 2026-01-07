// src/app/[locale]/admin/files/[id]/page.tsx
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getFile } from '@/actions/file/file.admin.actions'
import FileDetails from '@/components/FileDetails'
import { Link } from '@/navigation'

type PageProps = {
  params: Promise<{ id: string; locale: string }>
}

export default async function FileShowPage(props: PageProps) {
  const params = await props.params
  const t = await getTranslations('Admin')

  // 2. On récupère la donnée
  const file = await getFile(params.id)

  if (!file) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/files">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t('Actions.back')}</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{file.filename}</h1>
      </div>

      <FileDetails file={file} />
    </div>
  )
}
