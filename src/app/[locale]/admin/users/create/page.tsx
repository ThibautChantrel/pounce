'use client'

import { z } from 'zod'
import { toast } from 'sonner'
import { DataCreate, CreateFieldConfig } from '@/components/admin/data-create'
import { createUserAction } from '@/actions/user/user.admin.actions'
import { RoleOptions, RoleValues } from '@/utils/users'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Role } from '@prisma/client'

export default function CreateUserPage() {
  const router = useRouter()
  const t = useTranslations('Admin')

  const createUserSchema = z
    .object({
      name: z.string().min(2, { message: t('Users.validation.nameTooShort') }),
      email: z.string().email({ message: t('Users.validation.emailInvalid') }),
      role: z.enum([RoleValues.User, RoleValues.Admin] as const, {
        message: t('Users.validation.roleInvalid'),
      }),
      password: z
        .string()
        .min(8, { message: t('Users.validation.passwordTooShort') }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('Users.validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
  type CreateUserSchemaType = z.infer<typeof createUserSchema>

  const fields: CreateFieldConfig<CreateUserSchemaType>[] = [
    {
      name: 'name',
      label: t('Users.name'),
      type: 'text',
      placeholder: 'Ex: Jean Dupont',
    },
    {
      name: 'email',
      label: t('Users.email'),
      type: 'email',
      placeholder: 'jean.dupont@exemple.com',
    },
    {
      name: 'role',
      label: t('Users.role'),
      type: 'select',
      placeholder: 'Sélectionner un rôle',
      options: RoleOptions,
    },
    {
      name: 'password',
      label: t('Users.password'),
      type: 'password',
      placeholder: '••••••••',
    },
    {
      name: 'confirmPassword',
      label: t('Users.confirmPassword'),
      type: 'password',
      placeholder: '••••••••',
    },
  ]

  const handleSubmit = async (values: CreateUserSchemaType) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('email', values.email)
    formData.append('role', values.role)
    formData.append('password', values.password)

    const result = await createUserAction(formData)

    if (!result.success) {
      toast.error(result.error)
      throw new Error(result.error)
    }

    toast.success('Utilisateur créé avec succès')
    router.push(`/admin/users/${result.data?.id.toString()}`)
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Users.createTitle')}
        </h1>
        <p className="text-muted-foreground">{t('Users.createSubtitle')}</p>
      </div>

      <DataCreate
        schema={createUserSchema}
        fields={fields}
        defaultValues={{
          name: '',
          email: '',
          role: RoleValues.User,
          password: '',
          confirmPassword: '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Créer l'utilisateur"
        onCancel={() => router.back()}
      />
    </div>
  )
}
