import { redirect } from 'next/navigation'
import { auth } from '@/server/modules/auth/auth.config'
import Navbar from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default async function ConnectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <Navbar showConnexionStatus sticky />
      </div>
      <main className="grow">{children}</main>
      <Footer />
    </div>
  )
}
