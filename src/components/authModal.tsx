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

interface AuthModalProps {
  trigger: React.ReactNode
}

export default function AuthModal({ trigger }: AuthModalProps) {
  const t = useTranslations('Auth')

  const [open, setOpen] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [regState, regAction, regPending] = useActionState(registerAction, null)
  const [loginState, logAction, logPending] = useActionState(loginAction, null)

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
      handleClose()
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

  return (
    <Modal
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
      title={isLoginMode ? t('loginTitle') : t('registerTitle')}
      description={isLoginMode ? t('loginDesc') : t('registerDesc')}
      trigger={trigger}
    >
      <div className="flex flex-col gap-4 py-2">
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
            className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
          >
            {isLoginMode ? t('switchRegister') : t('switchLogin')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
