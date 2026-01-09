'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, Save } from 'lucide-react'
import { acceptedFileTypes } from '@/utils/files'
import { FileData } from '@/actions/file/file.admin.actions'
import FilePreview from './FilePreview'
import { useTranslations } from 'next-intl'

const formSchema = z.object({
  filename: z.string().min(1, 'Le nom du fichier est requis'),
})

interface FileUpdateFormProps {
  initialData: FileData
  onSubmit: (formData: FormData) => Promise<void>
  onCancel: () => void
}

export function FileUpdateForm({
  initialData,
  onSubmit,
  onCancel,
}: FileUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('Admin')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filename: initialData.filename,
    },
  })

  const handleRemoveSelected = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmitInternal(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    const formData = new FormData()
    formData.append('filename', values.filename)

    if (selectedFile) {
      formData.append('file', selectedFile)
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erreur dans le formulaire', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitInternal)}
        className="w-full"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Files.filename')}</FormLabel>
                  <FormControl>
                    <Input placeholder="mon-fichier.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('Files.changefile')}</FormLabel>
              <FormControl>
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  name="file"
                  accept={acceptedFileTypes}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setSelectedFile(file)
                  }}
                  className="cursor-pointer file:text-foreground"
                />
              </FormControl>
              <FormDescription>{t('Files.selectNewFile')}</FormDescription>
            </FormItem>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && <Save className="mr-2 h-4 w-4" />}
                {t('Actions.save')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                {t('Actions.cancel')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <FormLabel className="text-muted-foreground">
              {selectedFile ? 'Nouvel aperçu' : 'Fichier actuel'}
            </FormLabel>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-2 h-64 w-full">
              <FilePreview
                // Props conditionnelles
                file={selectedFile}
                url={!selectedFile ? `/api/files/${initialData.id}` : undefined}
                mimeType={!selectedFile ? initialData.mimeType : undefined}
                fileName={!selectedFile ? initialData.filename : undefined}
                onRemove={selectedFile ? handleRemoveSelected : undefined}
                // Styles passés en props (Headless approach)
                className="w-full h-full bg-white rounded-lg border border-slate-200 shadow-sm"
                iconClassName="text-slate-400 opacity-50"
              />
            </div>

            <p className="text-xs text-center text-muted-foreground mt-2">
              {selectedFile
                ? t('Files.newFileOnSave')
                : t('Files.noModifications')}
            </p>
          </div>
        </div>
      </form>
    </Form>
  )
}
