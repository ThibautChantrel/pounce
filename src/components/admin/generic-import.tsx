'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { Loader2, UploadCloud, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type GenericImportProps<T> = {
  title: string
  description?: string
  expectedColumns: { key: keyof T; label: string }[]
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDataParsed: (rawData: any[]) => T[] // Fonction pour nettoyer/typer les données
  onSubmitAction: (
    data: T[]
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<{ success: boolean; data?: any; error?: string }>
  onSuccess?: () => void
}
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GenericImport<T extends Record<string, any>>({
  title,
  description,
  expectedColumns,
  onDataParsed,
  onSubmitAction,
  onSuccess,
}: GenericImportProps<T>) {
  const [parsedData, setParsedData] = useState<T[]>([])
  const [isPending, setIsPending] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]

        // Convertir en JSON
        const rawData = XLSX.utils.sheet_to_json(ws)

        // Typer et nettoyer via la fonction passée en prop
        const formattedData = onDataParsed(rawData)
        setParsedData(formattedData)
      } catch (error) {
        console.error('Error parsing file:', error)
        toast.error('Impossible de lire ce fichier. Vérifiez le format.')
      }
    }
    reader.readAsBinaryString(file)
    // Reset l'input pour permettre de re-sélectionner le même fichier si besoin
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!parsedData.length) return
    setIsPending(true)

    try {
      const res = await onSubmitAction(parsedData)
      if (res.success) {
        toast.success(
          `Import réussi : ${res.data?.inserted || 0} ajoutés, ${res.data?.skipped || 0} doublons ignorés.`
        )
        setParsedData([])
        if (onSuccess) onSuccess()
      } else {
        toast.error(res.error || "Une erreur est survenue lors de l'import.")
      }
    } catch (error) {
      console.error('Critical error during import:', error)
      toast.error("Erreur critique lors de l'import.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {parsedData.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setParsedData([])}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Importer {parsedData.length} ligne(s)
            </Button>
          </div>
        )}
      </div>

      {parsedData.length === 0 ? (
        // ZONE D'UPLOAD
        <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 bg-muted/10 hover:bg-muted/30 transition-colors relative">
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="font-medium text-lg">
              Glissez-déposez un fichier Excel ou CSV
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Colonnes attendues :{' '}
              {expectedColumns.map((c) => c.label).join(', ')}
            </p>
          </div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="secondary" className="pointer-events-none">
            Parcourir les fichiers
          </Button>
        </div>
      ) : (
        // ZONE DE PRÉVISUALISATION (Générique)
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
            <span className="font-medium text-sm">
              Aperçu des données à importer
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {parsedData.length} éléments trouvés
            </span>
          </div>
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                <TableRow>
                  {expectedColumns.map((col) => (
                    <TableHead key={String(col.key)}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.map((row, index) => (
                  <TableRow key={index}>
                    {expectedColumns.map((col) => (
                      <TableCell key={String(col.key)}>
                        {/* Affichage basique générique */}
                        {String(row[col.key] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
