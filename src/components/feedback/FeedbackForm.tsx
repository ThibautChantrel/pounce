'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/navigation'
import { toast } from 'sonner'
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import { createFeedbackAction } from '@/actions/feedback/feedback.actions'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

// On garde uniquement les IDs pour l'ordre d'affichage
const QUESTION_IDS = [
  'sports',
  'frequency',
  'apps',
  'likes',
  'frustrations',
  'challenges',
  'metro',
  'ideal',
  'certification',
]

const AUTOSCROLL_DELAY = 3000

export function FeedbackForm() {
  const router = useRouter()
  const t = useTranslations('Feedbacks')

  // Reconstruction dynamique des questions avec les traductions
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
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentQIndex((prev) => (prev + 1) % questions.length)
    }, AUTOSCROLL_DELAY)

    return () => clearInterval(timer)
  }, [isPaused, questions.length])

  const currentQuestion = questions[currentQIndex]

  const handlePrev = () => {
    setCurrentQIndex((prev) => (prev - 1 + questions.length) % questions.length)
  }

  const handleNext = () => {
    setCurrentQIndex((prev) => (prev + 1) % questions.length)
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
    if (!validateForm()) {
      return
    }

    setIsPending(true)

    try {
      const response = await createFeedbackAction({
        email,
        message: message,
        subscribeToUpdates: subscribeToUpdates,
      })

      if (response.success) {
        toast.success(t('successMessage')) // Utilisation de la traduction
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
    <Card className="max-w-2xl mx-auto border shadow-sm dark:bg-zinc-900/60 backdrop-blur-sm overflow-hidden">
      <style>{`
        @keyframes fill-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div
        className="p-6 relative border-b transition-colors hover:bg-muted/50"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            <span>{t('inspirationLabel')}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handlePrev}
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {currentQIndex + 1} / {questions.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNext}
            >
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 min-h-20">
          <h3
            key={currentQIndex + 'title'}
            className="text-lg font-semibold leading-tight animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {currentQuestion.label}
          </h3>
          <p
            key={currentQIndex + 'sub'}
            className="text-sm text-muted-foreground animate-in fade-in slide-in-from-right-8 duration-500"
          >
            {currentQuestion.inspiration}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
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

      <CardContent className="p-4 space-y-6">
        {/* MESSAGE */}
        <div>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              if (errors.message)
                setErrors((prev) => ({ ...prev, message: undefined }))
            }}
            placeholder={t('messageLabel')} // Traduction ici aussi si tu veux, sinon texte libre
            className={cn(
              'min-h-50 resize-none text-base p-4',
              errors.message &&
                'border-destructive focus-visible:ring-destructive'
            )}
          />
          {errors.message && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4" />
              {errors.message}
            </p>
          )}
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            className={cn(
              errors.email &&
                'border-destructive focus-visible:ring-destructive'
            )}
          />
          {errors.email && (
            <p className="text-sm text-destructive font-medium flex items-center gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* CHECKBOX NEWSLETTER */}
        <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card/50">
          <Checkbox
            id="subscribe"
            checked={subscribeToUpdates}
            onCheckedChange={(checked) =>
              setSubscribeToUpdates(checked as boolean)
            }
            disabled={isPending}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="subscribe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('stayInformedLabel')}
            </label>
            <p className="text-sm text-muted-foreground">
              {t('stayInformedDesc')}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ...
            </>
          ) : (
            t('submitButton')
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
