'use client'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Download,
  Copy,
  Calendar,
  HardDrive,
  User,
  FileType,
  Map as MapIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations, useFormatter } from 'next-intl'
import { formatBytes } from '@/utils/files'
import { FileData } from '@/actions/file/file.admin.actions'
import FilePreview from '@/components/FilePreview'

export default function FileDetails({ file }: { file: FileData }) {
  const t = useTranslations('Admin')
  const format = useFormatter()

  const isImage = file.mimeType.startsWith('image/')
  const isGpx = file.filename.endsWith('.gpx') || file.mimeType.includes('gpx')
  const fileUrl = `/api/files/${file.id}`

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${fileUrl}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Lien copié dans le presse-papier')
  }

  const handleDownload = () => {
    window.open(fileUrl, '_blank')
  }
  console.log('file', file)

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-muted/30 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle
            className="flex items-center gap-2 text-lg truncate"
            title={file.filename}
          >
            {isImage ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : isGpx ? (
              <MapIcon className="h-5 w-5 text-green-600" />
            ) : (
              <FileText className="h-5 w-5 text-gray-500" />
            )}
            {file.filename}
          </CardTitle>
          <span className="px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700 font-mono">
            {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid md:grid-cols-2">
          <div className="bg-slate-50 flex items-center justify-center p-6 min-h-62.5 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-full h-64 max-w-sm mx-auto">
              <FilePreview
                url={fileUrl}
                mimeType={file.mimeType}
                fileName={file.filename}
                className="bg-white rounded-lg border border-slate-200 shadow-sm h-full w-full"
                iconClassName="text-slate-400 w-16 h-16"
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                {t('Files.details')}
              </h3>

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('Files.size')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileType className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('Files.type')}
                    </p>
                    <p className="text-sm text-slate-500 font-mono">
                      {file.mimeType}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('Files.uploadDate')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format.dateTime(file.createdAt, {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-slate-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {t('Files.updateDate')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format.dateTime(file.updatedAt, {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {file.createdById && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {t('Files.uploadedBy')}
                      </p>
                      <p className="text-sm text-slate-500">
                        {file.createdById}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="bg-slate-50/50 p-4 flex justify-end gap-3">
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          {t('Actions.copyLink')}
        </Button>
        <Button onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          {t('Actions.download')}
        </Button>
      </CardFooter>
    </Card>
  )
}
