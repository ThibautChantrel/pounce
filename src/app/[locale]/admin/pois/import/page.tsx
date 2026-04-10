'use client'

import { useRouter } from '@/navigation'
import { bulkCreatePoiAction } from '@/actions/poi/poi.admin.actions'
import { CreatePoiInput } from '@/server/modules/poi/poi.types'
import { GenericImport } from '@/components/admin/generic-import'

export default function ImportPoisPage() {
  const router = useRouter()

  // 1. Définition des colonnes pour la table de prévisualisation
  const poiExpectedColumns: { key: keyof CreatePoiInput; label: string }[] = [
    { key: 'name', label: 'Nom' },
    { key: 'typeId', label: 'Type (ID optionnel)' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'description', label: 'Description' },
  ]

  // 2. Le parseur intelligent
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsePoiData = (rawData: any[]): CreatePoiInput[] => {
    return rawData.map((row) => {
      return {
        name: row.name || row.Name || row.Nom || 'Sans Nom',
        typeId:
          (row.typeId || row.TypeId || row.TYPE_ID || row.type || row.Type) ??
          undefined,
        latitude: Number(row.latitude || row.Lat || row.Latitude) || 0,
        longitude: Number(row.longitude || row.Lng || row.Longitude) || 0,
        description: row.description || row.Description || undefined,
      }
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <GenericImport<CreatePoiInput>
        title="Importer des Points d'Intérêt"
        description="Chargez un fichier Excel (.xlsx) contenant vos POIs. Les doublons (nom ou coordonnées identiques) seront automatiquement ignorés."
        expectedColumns={poiExpectedColumns}
        onDataParsed={parsePoiData}
        onSubmitAction={bulkCreatePoiAction}
        onSuccess={() => {
          router.push('/admin/pois')
        }}
      />
    </div>
  )
}
