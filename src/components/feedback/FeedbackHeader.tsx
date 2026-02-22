'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface Props {
  title: string
  description: string
}

export function FeedbackHeader({ title, description }: Props) {
  const t = useTranslations('Feedbacks')

  return (
    <div className="text-center space-y-6">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground">
        <span className="w-6 h-px bg-muted-foreground/40" />
        {t('badge')}
        <span className="w-6 h-px bg-muted-foreground/40" />
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-medium tracking-tight leading-tight">
        {title}
      </h1>

      {/* Description */}
      <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-light">
        {description}
      </p>

      {/* Subtle animated line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '80px' }}
        transition={{ duration: 0.8 }}
        className="h-px bg-foreground/30 mx-auto mt-6"
      />
    </div>
  )
}
