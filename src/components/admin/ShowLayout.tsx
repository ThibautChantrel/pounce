import { Button } from '@/components/ui/button'
import { EditButton } from '@/components/ui/custom/edit-button'
import { Link } from '@/navigation'
import { ChevronLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function ShowLayout({
  children,
  module,
}: {
  children: React.ReactNode
  module: string
}) {
  const t = await getTranslations('Admin')
  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link href={`/admin/${module}`}>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">{t('Actions.back')}</span>
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <EditButton />
        </div>
      </div>

      <main className="grow">{children}</main>
    </div>
  )
}
