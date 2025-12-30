'use client'

import { useState, useActionState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { loginAction, registerAction } from '@/actions/auth/auth.actions'
import { Separator } from './ui/separator'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  trigger: React.ReactNode
}

export default function AuthModal({ trigger }: AuthModalProps) {
  const t = useTranslations('Auth')
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

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
  const error = isLoginMode ? loginState?.error : regState?.error

  /** ✅ GESTION SUCCÈS REGISTER (SAFE) */
  useEffect(() => {
    if (open && regState?.success) {
      toast.success(t('successRegister'))
      handleClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regState?.success])

  /** ✅ GESTION SUCCÈS LOGIN (SAFE) */
  useEffect(() => {
    if (open && loginState?.success) {
      toast.success(t('successLogin'))
      handleClose()
      router.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginState?.success])

  const handleClose = () => {
    setOpen(false)
    setIsLoginMode(true)
    setPassword('')
    setConfirmPassword('')
    setPasswordError(null)
  }

  /** Validation client register */
  const handleRegisterSubmit = (formData: FormData) => {
    if (password !== confirmPassword) {
      setPasswordError(t('passwordMismatch'))
      return
    }

    setPasswordError(null)
    regAction(formData)
  }

  useEffect(() => {
    if (loginState?.error) {
      toast.error(loginState.error)
    }
  }, [loginState?.error])

  return (
    <Modal
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
      title={isLoginMode ? t('loginTitle') : t('registerTitle')}
      description={isLoginMode ? t('loginDesc') : t('registerDesc')}
      trigger={trigger}
    >
      <div className="flex flex-col gap-4 py-2">
        <Button variant="outline" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          {t('googleAuth')}
        </Button>
        <Separator className="*:data-[slot=field-separator-content]:bg-card" />
        <form
          action={isLoginMode ? logAction : handleRegisterSubmit}
          className="flex flex-col gap-4"
        >
          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          {/* NAME */}
          {!isLoginMode && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input id="name" name="name" />
            </div>
          )}

          {/* PASSWORD */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('passwordLabel')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          {!isLoginMode && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="confirmPassword">
                {t('confirmPasswordLabel')}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {/* ERRORS */}
          {passwordError && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {passwordError}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            variant={isLoginMode ? 'default' : 'canopy'}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoginMode ? t('loginBtn') : t('registerBtn')}
          </Button>
        </form>

        {/* SWITCH */}
        <div className="text-center mt-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => setIsLoginMode((v) => !v)}
            className="text-sm cursor-pointer text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
          >
            {isLoginMode ? t('switchRegister') : t('switchLogin')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
