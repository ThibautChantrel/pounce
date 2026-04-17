'use client'

import { useState, useActionState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { loginAction, registerAction } from '@/actions/auth/auth.actions'
import { checkPseudoAvailability } from '@/actions/auth/check-pseudo.action'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface AuthModalProps {
  trigger: React.ReactNode
}

type PseudoStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <XCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
      {children}
    </div>
  )
}

export default function AuthModal({ trigger }: AuthModalProps) {
  const router = useRouter()
  const t = useTranslations('Auth')

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'login' | 'register'>('login')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [pseudo, setPseudo] = useState('')
  const [pseudoStatus, setPseudoStatus] = useState<PseudoStatus>('idle')

  const [regState, regAction, regPending] = useActionState(registerAction, {
    success: false,
    error: '',
    code: '',
  })
  const [loginState, logAction, logPending] = useActionState(loginAction, {
    success: false,
    error: '',
    code: '',
  })

  const pending = regPending || logPending

  const handleClose = useCallback(() => {
    setOpen(false)
    setTab('login')
    setPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setPseudo('')
    setPseudoStatus('idle')
  }, [])

  useEffect(() => {
    if (open && regState?.success) {
      toast.success(t('successRegister'))
      handleClose()
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regState?.success])

  useEffect(() => {
    if (open && loginState?.success) {
      toast.success(t('successLogin'))
      handleClose()
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState?.success])

  useEffect(() => {
    if (loginState?.error) toast.error(loginState.error)
  }, [loginState?.error])

  useEffect(() => {
    if (!pseudo || pseudo.length < 3) {
      setPseudoStatus(pseudo.length > 0 ? 'invalid' : 'idle')
      return
    }
    const forbidden = ['admin', 'pounce']
    if (forbidden.some((w) => pseudo.toLowerCase().includes(w))) {
      setPseudoStatus('invalid')
      return
    }
    setPseudoStatus('checking')
    const timer = setTimeout(async () => {
      const { available } = await checkPseudoAvailability(pseudo)
      setPseudoStatus(available ? 'available' : 'taken')
    }, 500)
    return () => clearTimeout(timer)
  }, [pseudo])

  const handleRegisterSubmit = (formData: FormData) => {
    if (password !== confirmPassword) {
      setPasswordError(t('validation.passwordMismatch'))
      return
    }
    setPasswordError(null)
    formData.set('pseudo', pseudo)
    regAction(formData)
  }

  const pseudoHint =
    pseudoStatus === 'checking' ? (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        {t('validation.pseudoChecking')}
      </span>
    ) : pseudoStatus === 'available' ? (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="w-3 h-3" />
        {t('validation.pseudoAvailable')}
      </span>
    ) : null

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>
      <Dialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
      >
        <DialogContent className="sm:max-w-md p-0 bg-background border-0 rounded-2xl shadow-2xl">
          <VisuallyHidden.Root>
            <DialogTitle>Rejoindre Pounce</DialogTitle>
          </VisuallyHidden.Root>
          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Rejoindre Pounce
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Certifie tes explorations.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="px-7">
            <div className="flex bg-muted rounded-full p-1">
              {(['login', 'register'] as const).map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant="ghost"
                  onClick={() => setTab(v)}
                  className={cn(
                    'flex-1 h-9 text-sm font-medium rounded-full transition-all duration-200',
                    tab === v
                      ? 'bg-card text-foreground shadow-sm hover:bg-card'
                      : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                  )}
                >
                  {v === 'login' ? 'Connexion' : 'Inscription'}
                </Button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="px-7 pb-7 pt-4 max-h-[70vh] overflow-y-auto">
            {tab === 'login' ? (
              <form action={logAction} className="flex flex-col gap-4">
                <FormField label={t('emailLabel')} required>
                  <Input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="rounded-full bg-muted border-0 h-11 px-4"
                  />
                </FormField>

                <FormField label={t('passwordLabel')} required>
                  <Input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="rounded-full bg-muted border-0 h-11 px-4"
                  />
                </FormField>

                {loginState?.error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    {loginState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={pending}
                  className="w-full rounded-full mt-1 h-12 text-base"
                >
                  {logPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('loginBtn')}
                </Button>
              </form>
            ) : (
              <form
                action={handleRegisterSubmit}
                className="flex flex-col gap-4"
              >
                <FormField label={t('emailLabel')} required>
                  <Input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="rounded-full bg-muted border-0 h-11 px-4"
                  />
                </FormField>

                {/* Password row */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label={t('passwordLabel')}
                    required
                    error={passwordError ?? undefined}
                  >
                    <Input
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                  <FormField label={t('confirmPasswordLabel')} required>
                    <Input
                      name="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                </div>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t('firstNameLabel')} required>
                    <Input
                      name="firstName"
                      required
                      autoComplete="given-name"
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                  <FormField label={t('lastNameLabel')} required>
                    <Input
                      name="lastName"
                      required
                      autoComplete="family-name"
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                </div>

                {/* Pseudo */}
                <FormField
                  label={t('pseudoLabel')}
                  required
                  error={
                    pseudoStatus === 'taken'
                      ? t('validation.pseudoTaken')
                      : undefined
                  }
                >
                  <div className="relative">
                    <Input
                      name="pseudo_display"
                      required
                      value={pseudo}
                      onChange={(e) => setPseudo(e.target.value)}
                      placeholder="ex: titou_trail"
                      className="rounded-full bg-muted border-0 h-11 px-4 pr-28"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {pseudoHint}
                    </div>
                  </div>
                </FormField>

                <FormField label={t('nationalityLabel')} required>
                  <Input
                    name="nationality"
                    required
                    placeholder="ex: Française"
                    className="rounded-full bg-muted border-0 h-11 px-4"
                  />
                </FormField>

                {/* Gender + Birthdate row */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t('genderLabel')} required>
                    <Select name="gender" required>
                      <SelectTrigger className="rounded-full bg-muted border-0 h-11 px-4">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">{t('genderMale')}</SelectItem>
                        <SelectItem value="FEMALE">
                          {t('genderFemale')}
                        </SelectItem>
                        <SelectItem value="NON_BINARY">
                          {t('genderNonBinary')}
                        </SelectItem>
                        <SelectItem value="OTHER">
                          {t('genderOther')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t('birthDateLabel')} required>
                    <Input
                      name="birthDate"
                      type="date"
                      required
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                </div>

                {/* Height + Weight (optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label={t('heightLabel')}>
                    <Input
                      name="height"
                      type="number"
                      min={100}
                      max={250}
                      placeholder="178"
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                  <FormField label={t('weightLabel')}>
                    <Input
                      name="weight"
                      type="number"
                      min={30}
                      max={300}
                      step={0.1}
                      placeholder="75"
                      className="rounded-full bg-muted border-0 h-11 px-4"
                    />
                  </FormField>
                </div>

                {regState?.error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    {regState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="sienna"
                  size="lg"
                  disabled={
                    pending ||
                    pseudoStatus === 'taken' ||
                    pseudoStatus === 'checking'
                  }
                  className="w-full rounded-full mt-1 h-12 text-base"
                >
                  {regPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('registerBtn')}
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
