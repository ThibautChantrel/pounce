import UserEditPage from '@/components/admin/users/UsersEdit'
import { getUserById } from '@/server/modules/user/services/user.admin.service'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function FileEditPage(props: PageProps) {
  const params = await props.params

  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return <UserEditPage user={user} />
}
