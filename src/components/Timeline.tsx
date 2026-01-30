import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

type TimelineItem<T> = {
  id: string
  data: T
}

type TimelineProps<T> = {
  title?: string
  icon?: LucideIcon
  items: TimelineItem<T>[]

  renderMarker?: (index: number, item: T) => ReactNode
  renderContent: (item: T, index: number) => ReactNode

  renderEnd?: ReactNode
}

function DefaultMarker({ index }: { index: number }) {
  return (
    <div className="w-7 h-7 rounded-full bg-white dark:bg-black border-2 border-canopy flex items-center justify-center text-[10px] font-bold text-canopy shadow-sm">
      {index + 1}
    </div>
  )
}

function EndMarker() {
  return (
    <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white border-2 border-zinc-900 dark:border-white flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />
    </div>
  )
}

export function Timeline<T>({
  title,
  icon: Icon,
  items,
  renderMarker,
  renderContent,
  renderEnd,
}: TimelineProps<T>) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
      {title && (
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-clay" />}
          {title}
        </h3>
      )}

      <div className="relative pl-2 space-y-8">
        {/* Ligne verticale */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

        {items.map((item, index) => (
          <div key={item.id} className="relative flex gap-4">
            {/* Marker */}
            <div className="relative z-10 shrink-0 mt-1">
              {renderMarker ? (
                renderMarker(index, item.data)
              ) : (
                <DefaultMarker index={index} />
              )}
            </div>

            {/* Contenu */}
            <div className="pb-2 w-full">{renderContent(item.data, index)}</div>
          </div>
        ))}

        {/* Élément de fin optionnel */}
        {renderEnd && (
          <div className="relative flex gap-4">
            <div className="relative z-10 shrink-0 mt-1">
              <EndMarker />
            </div>
            <div>{renderEnd}</div>
          </div>
        )}
      </div>
    </div>
  )
}
