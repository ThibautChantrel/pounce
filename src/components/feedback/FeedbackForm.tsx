'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ArrowRight, Lightbulb, X } from 'lucide-react'
import { motion } from 'framer-motion'

import { createFeedbackAction } from '@/actions/feedback/feedback.actions'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

const QUESTION_IDS = [
  'mindset',
  'current_apps',
  'the_gap',
  'metro_concept',
  'certification_value',
  'magic_wand',
]

const AUTOSCROLL_DELAY = 3000

export function FeedbackForm() {
  const router = useRouter()
  const t = useTranslations('Feedbacks')

  // Génération dynamique des questions
  const questions = QUESTION_IDS.map((id) => ({
    id,
    label: t(`questions.${id}.label`),
    inspiration: t(`questions.${id}.inspiration`),
  }))

  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(true)

  const [errors, setErrors] = useState<{ message?: string; email?: string }>({})
  const [isPending, setIsPending] = useState(false)

  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || questions.length === 0) return

    const timer = setInterval(() => {
      setCurrentQIndex((prev) => (prev + 1) % questions.length)
    }, AUTOSCROLL_DELAY)

    return () => clearInterval(timer)
  }, [isPaused, questions.length])

  const currentQuestion = questions[currentQIndex] || {
    label: '',
    inspiration: '',
  }

  const handlePrev = () => {
    setCurrentQIndex((prev) => (prev - 1 + questions.length) % questions.length)
  }

  const handleNext = () => {
    setCurrentQIndex((prev) => (prev + 1) % questions.length)
  }

  const handleClose = () => {
    router.back()
  }

  const validateForm = () => {
    const newErrors: { message?: string; email?: string } = {}
    let isValid = true

    if (!message.trim()) {
      newErrors.message = t('validation.messageTooShort')
      isValid = false
    }

    if (!email.trim()) {
      newErrors.email = t('validation.emailInvalid')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validation.emailInvalid')
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsPending(true)

    try {
      const response = await createFeedbackAction({
        email,
        message,
        subscribeToUpdates,
      })

      if (response.success) {
        toast.success(t('successMessage'))
        router.push('/')
      } else {
        toast.error(response.error || t('errorMessage'))
      }
    } catch (error) {
      toast.error(t('errorMessage'))
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <style>{`
        @keyframes fill-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="border border-border/40 bg-background/70 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_15px_50px_-20px_rgba(0,0,0,0.35)] relative flex flex-col">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-20 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="p-8 md:p-10 pb-6 relative bg-muted/10 transition-colors"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-between mb-6 pr-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-muted-foreground">
              <Lightbulb className="w-4 h-4" />
              <span>{t('inspirationLabel')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground w-8 text-center tabular-nums">
                {currentQIndex + 1}/{questions.length}
              </span>
              <button
                onClick={handleNext}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 min-h-[70px]">
            <h3
              key={currentQIndex + 'title'}
              className="text-base md:text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {currentQuestion.label}
            </h3>
            <p
              key={currentQIndex + 'sub'}
              className="text-sm text-muted-foreground font-light animate-in fade-in slide-in-from-right-8 duration-500"
            >
              {currentQuestion.inspiration}
            </p>
          </div>

          {/* Barre de progression du timer */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-border/40">
            <div
              key={currentQIndex}
              className="h-full bg-primary"
              style={{
                animation: `fill-progress ${AUTOSCROLL_DELAY}ms linear forwards`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            />
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="p-8 md:p-10 space-y-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <textarea
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  if (errors.message)
                    setErrors((prev) => ({ ...prev, message: undefined }))
                }}
                className={cn(
                  'w-full bg-transparent border rounded-md px-3 outline-none text-sm md:text-base py-2 resize-none transition-colors focus:ring-1 focus:ring-primary',
                  errors.message
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-border focus:border-primary'
                )}
                placeholder={t('messageLabel')}
              />
              {errors.message && (
                <p className="text-xs text-red-500 animate-in fade-in">
                  {errors.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={cn(
                  'w-full bg-transparent border rounded-md px-3 outline-none text-sm md:text-base py-2 transition-colors focus:ring-1 focus:ring-primary',
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-border focus:border-primary'
                )}
                placeholder={t('emailLabel')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 animate-in fade-in">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 pt-4">
            <input
              type="checkbox"
              id="subscribe"
              checked={subscribeToUpdates}
              onChange={(e) => setSubscribeToUpdates(e.target.checked)}
              disabled={isPending}
              className="mt-1 accent-primary w-4 h-4 cursor-pointer"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="subscribe"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {t('stayInformedLabel')}
              </label>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">
                {t('stayInformedDesc')}
              </p>
            </div>
          </div>

          {/* BOUTON SUBMIT (Style minimaliste) */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center text-sm font-medium tracking-wide hover:opacity-60 transition disabled:opacity-40 cursor-pointer"
            >
              {isPending && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {isPending ? '...' : t('submitButton')} {!isPending && '→'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
