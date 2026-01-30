import { MapPin } from 'lucide-react'

export function TrackMapPlaceholder() {
  return (
    <div className="h-96 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed">
      <div className="text-center text-muted-foreground">
        <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
        Carte interactive bientôt disponible
      </div>
    </div>
  )
}
