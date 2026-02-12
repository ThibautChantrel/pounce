'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

import { createFeedbackAction } from '@/actions/feedback/feedback.actions'
import { useRouter } from '@/navigation'

export function FeedbackForm() {
  const t = useTranslations('Feedbacks')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  // Schéma de validation Client (identique à ton schéma Server Action)
  const schema = z.object({
    email: z.string().email(t('validation.emailInvalid')),
    message: z.string().min(10, t('validation.messageTooShort')),
    subscribeToUpdates: z.boolean().default(true),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      message: '',
      subscribeToUpdates: true,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsPending(true)
    try {
      const response = await createFeedbackAction(data)

      if (response.success) {
        toast.success(t('successMessage'))
        reset()
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        const errorMsg =
          response.code === 'RATE_LIMIT_EXCEEDED'
            ? t('validation.toManyFeedbacks')
            : t('errorMessage')

        toast.error(response.error || errorMsg)
      }
    } catch (error) {
      toast.error(t('errorMessage'))
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="max-w-xl mx-auto border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Champ Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              {...register('email')}
              className={
                errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
              }
              disabled={isPending}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Champ Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('messageLabel')}</Label>
            <Textarea
              id="message"
              placeholder="J'adore l'étape 3 du challenge, mais..."
              className={`min-h-37.5 resize-none ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              {...register('message')}
              disabled={isPending}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
          </div>

          {/* Checkbox Newsletter (Optionnel) */}
          <div className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
            <Checkbox
              id="subscribe"
              checked={watch('subscribeToUpdates')}
              onCheckedChange={(checked) =>
                setValue('subscribeToUpdates', checked as boolean)
              }
              disabled={isPending}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="subscribe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Rester informé
              </label>
              <p className="text-sm text-muted-foreground">
                Je souhaite recevoir des nouvelles sur les prochains défis.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-canopy/90 text-secondary"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t('submitButton')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
