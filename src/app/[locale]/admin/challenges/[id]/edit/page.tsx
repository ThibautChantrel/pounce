import { getChallengeAction } from '@/actions/challenge/challenge.admin.action'
import ChallengeEdit from '@/components/admin/challenges/ChellengesEdit'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ChallengeEditPage(props: PageProps) {
  const params = await props.params

  const challenge = await getChallengeAction(params.id)

  if (!challenge) {
    notFound()
  }

  return <ChallengeEdit challenge={challenge} />
}
