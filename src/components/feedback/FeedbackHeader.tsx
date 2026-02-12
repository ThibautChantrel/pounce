import { MessageSquareHeart } from 'lucide-react'

interface FeedbackHeaderProps {
  title: string
  description: string
}

export function FeedbackHeader({ title, description }: FeedbackHeaderProps) {
  return (
    <div className="text-center space-y-4 mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-canopy/10 text-canopy mb-2">
        <MessageSquareHeart className="w-8 h-8" />
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground">
        {title}
      </h1>
      <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  )
}
