'use client'

import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataUpdate, UpdateFieldConfig } from '@/components/admin/data-update'
import { useTranslations } from 'next-intl'
import { updateUserAction } from '@/actions/user/user.admin.actions'
import { RoleOptions, RoleValues } from '@/utils/users'

const userFormSchema = z.object({
  pseudo: z.string().optional().nullable(),
  email: z.string().email('Adresse email invalide'),
  role: z.enum([RoleValues.Admin, RoleValues.User]),
  emailVerified: z.date().nullable().optional(),
})

type UserFormSchema = typeof userFormSchema
type UserFormInput = z.input<UserFormSchema>
type UserFormOutput = z.output<UserFormSchema>

interface UserData {
  id: string
  pseudo: string | null
  email: string
  role: 'ADMIN' | 'USER'
}

interface UserEditPageProps {
  user: UserData
}

export default function UserEditPage({ user }: UserEditPageProps) {
  const router = useRouter()
  const t = useTranslations('Admin')

  const fields: UpdateFieldConfig<UserFormInput>[] = [
    {
      name: 'pseudo',
      label: t('Users.name'),
      type: 'text',
      placeholder: 'Ex: jean_dupont',
    },
    {
      name: 'email',
      label: t('Users.email'),
      type: 'email',
    },
    {
      name: 'role',
      label: t('Users.role'),
      type: 'select',
      options: RoleOptions,
    },
    {
      name: 'emailVerified',
      label: t('Users.verifiedAt'),
      type: 'date',
      description: t('Users.VerifiedEmpty'),
    },
  ]

  const handleSubmit = async (values: UserFormOutput) => {
    try {
      const formData = new FormData()
      formData.append('id', user.id)
      formData.append('pseudo', values.pseudo || '')
      formData.append('email', values.email)
      formData.append('role', values.role)
      if (values.emailVerified) {
        formData.append('emailVerified', values.emailVerified.toISOString())
      }

      const result = await updateUserAction(user.id, formData)

      if (result?.error) {
        toast.error('Error : ' + result.error)
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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Users.updateTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('Users.updateSubtitle', { userName: user.pseudo || user.email })}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <DataUpdate
          schema={userFormSchema}
          fields={fields}
          defaultValues={{
            pseudo: user.pseudo || '',
            email: user.email,
            role: user.role,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel={t('Actions.update')}
        />
      </div>
    </div>
  )
}
