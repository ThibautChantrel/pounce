'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import {
  updateUserAction,
  resetUserPasswordAction,
} from '@/actions/user/user.admin.actions'
import { RoleOptions, RoleValues } from '@/utils/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Pencil, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

function generatePassword(): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  return Array.from(
    { length: 14 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

const userFormSchema = z.object({
  pseudo: z.string().optional().nullable(),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  gender: z
    .enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'])
    .optional()
    .nullable(),
  birthDate: z.string().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  role: z.enum([RoleValues.Admin, RoleValues.User]),
  isVerified: z.boolean().optional(),
  isCertified: z.boolean().optional(),
  emailVerified: z.string().nullable().optional(),
})

type UserFormSchema = typeof userFormSchema
type UserFormInput = z.input<UserFormSchema>
type UserFormOutput = z.output<UserFormSchema>

interface UserData {
  id: string
  pseudo: string | null
  email: string
  firstName: string | null
  lastName: string | null
  nationality: string | null
  gender: string | null
  birthDate: Date | null
  height: number | null
  weight: number | null
  role: 'ADMIN' | 'USER'
  isVerified: boolean
  isCertified: boolean
  emailVerified: Date | null
}

interface UserEditPageProps {
  user: UserData
}

export default function UserEditPage({ user }: UserEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin')
  const tAuth = useTranslations('Auth')

  const GENDER_OPTIONS = [
    { label: tAuth('genderMale'), value: 'MALE' },
    { label: tAuth('genderFemale'), value: 'FEMALE' },
    { label: tAuth('genderNonBinary'), value: 'NON_BINARY' },
    { label: tAuth('genderOther'), value: 'OTHER' },
  ]

  const [passwordUnlocked, setPasswordUnlocked] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fields: UpdateFieldConfig<UserFormInput>[] = [
    {
      name: 'pseudo',
      label: t('Users.pseudo'),
      type: 'text',
      placeholder: 'ex: jean_dupont',
    },
    {
      name: 'email',
      label: t('Users.email'),
      type: 'email',
    },
    {
      name: 'firstName',
      label: t('Users.firstName'),
      type: 'text',
    },
    {
      name: 'lastName',
      label: t('Users.lastName'),
      type: 'text',
    },
    {
      name: 'nationality',
      label: t('Users.nationality'),
      type: 'text',
    },
    {
      name: 'gender',
      label: t('Users.gender'),
      type: 'select',
      options: GENDER_OPTIONS,
    },
    {
      name: 'birthDate',
      label: t('Users.birthDate'),
      type: 'date-only',
    },
    {
      name: 'role',
      label: t('Users.role'),
      type: 'select',
      options: RoleOptions,
    },
    {
      name: 'height',
      label: `${t('Users.height')} (cm)`,
      type: 'number',
    },
    {
      name: 'weight',
      label: `${t('Users.weight')} (kg)`,
      type: 'number',
    },
    {
      name: 'isVerified',
      label: t('Users.isVerified'),
      type: 'boolean',
    },
    {
      name: 'isCertified',
      label: t('Users.isCertified'),
      type: 'boolean',
    },
    {
      name: 'emailVerified',
      label: t('Users.verifiedAt'),
      type: 'date',
      description: t('Users.VerifiedEmpty'),
      className: 'md:col-span-2',
    },
  ]

  const handleSubmit = async (values: UserFormOutput) => {
    try {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('pseudo', values.pseudo || '')
      formData.append('firstName', values.firstName || '')
      formData.append('lastName', values.lastName || '')
      formData.append('nationality', values.nationality || '')
      formData.append('gender', values.gender || '')
      formData.append('birthDate', values.birthDate || '')
      formData.append(
        'height',
        values.height != null ? String(values.height) : ''
      )
      formData.append(
        'weight',
        values.weight != null ? String(values.weight) : ''
      )
      formData.append('role', values.role)
      formData.append('isVerified', String(values.isVerified ?? true))
      formData.append('isCertified', String(values.isCertified ?? false))
      if (values.emailVerified) {
        formData.append('emailVerified', values.emailVerified)
      }

      const result = await updateUserAction(user.id, formData)

      if (result?.error) {
        toast.error('Erreur : ' + result.error)
      } else {
        toast.success(t('Users.updateSuccess'))
        router.refresh()
        router.back()
      }
    } catch (error) {
      console.error(error)
      toast.error(t('Users.unknownError'))
    }
  }

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) return
    setResetting(true)
    try {
      const result = await resetUserPasswordAction(user.id, newPassword)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(t('Users.passwordResetSuccess'))
        setPasswordUnlocked(false)
        setNewPassword('')
        setShowPassword(false)
      }
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Users.updateTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('Users.updateSubtitle', {
            userName: user.pseudo || user.email,
          })}
        </p>
      </div>

      {/* Main form */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={userFormSchema}
          fields={fields}
          defaultValues={{
            pseudo: user.pseudo || '',
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            nationality: user.nationality || '',
            gender: (user.gender as UserFormInput['gender']) || undefined,
            birthDate: user.birthDate
              ? user.birthDate.toISOString().slice(0, 10)
              : '',
            height: user.height ?? undefined,
            weight: user.weight ?? undefined,
            role: user.role,
            isVerified: user.isVerified,
            isCertified: user.isCertified,
            emailVerified: user.emailVerified
              ? user.emailVerified.toISOString()
              : null,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={t('Actions.update')}
        />
      </div>

      {/* Password reset */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">
              {t('Users.passwordReset')}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('Users.passwordResetSubtitle')}
            </p>
          </div>
          {!passwordUnlocked && (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              title={t('Users.passwordResetUnlock')}
              onClick={() => setPasswordUnlocked(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!passwordUnlocked}
              placeholder={
                passwordUnlocked
                  ? t('Users.newPasswordPlaceholder')
                  : '••••••••••••••'
              }
              className={cn(
                'pr-10',
                !passwordUnlocked && 'opacity-50 cursor-not-allowed'
              )}
            />
            {passwordUnlocked && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </div>

          {passwordUnlocked && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setNewPassword(generatePassword())}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('Users.generatePassword')}
            </Button>
          )}
        </div>

        {passwordUnlocked && (
          <div className="flex gap-3 mt-4 pt-4 border-t">
            <Button
              type="button"
              disabled={!newPassword || newPassword.length < 6 || resetting}
              onClick={handlePasswordReset}
            >
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('Users.resetPasswordBtn')}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setPasswordUnlocked(false)
                setNewPassword('')
                setShowPassword(false)
              }}
            >
              {t('Actions.cancel')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
