'use client'

import { useState } from 'react'
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

const formSchema = z.object({
  filename: z.string().min(1, 'Le nom du fichier est requis'),
})

interface FileUpdateFormProps {
  initialData: {
    filename: string
  }
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filename: initialData.filename,
    },
  })

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
        className="space-y-6 max-w-lg"
      >
        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du fichier</FormLabel>
              <FormControl>
                <Input placeholder="mon-fichier.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Remplacer le fichier (Optionnel)</FormLabel>
          <FormControl>
            <Input
              id="file-upload"
              type="file"
              name="file"
              accept={acceptedFileTypes}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setSelectedFile(file)
              }}
            />
          </FormControl>
          <FormDescription>
            Laissez vide si vous ne voulez pas modifier le contenu.
          </FormDescription>
        </FormItem>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  )
}
