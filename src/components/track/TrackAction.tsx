import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function TrackActions({ gpxUrl }: { gpxUrl: string }) {
  return (
    <Card>
      <div className="p-1 bg-canopy/10">
        <Button asChild size="lg" className="w-full bg-canopy text-white">
          <a href={gpxUrl} download>
            <Download className="w-4 h-4 mr-2" />
            Télécharger le GPX
          </a>
        </Button>
      </div>
    </Card>
  )
}
