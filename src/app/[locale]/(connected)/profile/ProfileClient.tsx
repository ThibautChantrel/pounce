'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Activity, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/actions/auth/auth.actions'
import { Gender } from '@prisma/client'

type UserProfile = {
  id: string
  pseudo: string | null
  firstName: string | null
  lastName: string | null
  email: string
  nationality: string | null
  gender: Gender | null
  birthDate: Date | null
  height: number | null
  weight: number | null
}

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Homme',
  FEMALE: 'Femme',
  NON_BINARY: 'Non binaire',
  OTHER: 'Autre',
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  return email?.slice(0, 2).toUpperCase() ?? '?'
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">
        {value || '-'}
      </span>
    </div>
  )
}

export default function ProfileClient({ user }: { user: UserProfile }) {
  const router = useRouter()

  const initials = getInitials(user.firstName, user.lastName, user.email)
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email

  const handleLogout = async () => {
    await logoutAction()
    router.refresh()
    router.push('/')
  }

  const birthDateStr = user.birthDate
    ? new Date(user.birthDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header banner */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-sienna flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{displayName}</h1>
          <p className="text-primary-foreground/70 text-sm truncate">
            {user.pseudo && `@${user.pseudo} · `}
            {user.email}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="shrink-0 rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Se déconnecter
        </Button>
      </div>

      {/* Personal info card */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-5">
          <User className="w-4 h-4" />
          Informations personnelles
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <InfoField label="Prénom" value={user.firstName} />
          <InfoField label="Nom" value={user.lastName} />
          <InfoField
            label="Pseudo"
            value={user.pseudo ? `@${user.pseudo}` : null}
          />
          <InfoField label="Email" value={user.email} />
          <InfoField label="Nationalité" value={user.nationality} />
          <InfoField
            label="Genre"
            value={user.gender ? GENDER_LABELS[user.gender] : null}
          />
          <InfoField label="Date de naissance" value={birthDateStr} />
          <InfoField
            label="Taille"
            value={user.height ? `${user.height} cm` : null}
          />
          <InfoField
            label="Poids"
            value={user.weight ? `${user.weight} kg` : null}
          />
        </div>
      </div>

      {/* Strava card (visual only) */}
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Connecter Strava
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              Synchronise automatiquement tes activités Strava avec Pounce.
              Aucune action manuelle : tes parcours sont certifiés dès
              qu&apos;ils correspondent à un défi.
            </p>

            <ul className="mt-3 space-y-1.5">
              {[
                'Synchronisation automatique des activités',
                'Détection automatique des parcours complétés',
                'Statistiques enrichies (allure, dénivelé, FC)',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-sienna">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
          <span className="text-sm text-muted-foreground">Non connecté</span>
          <Button variant="sienna" className="rounded-full" disabled>
            <Activity className="w-4 h-4 mr-1.5" />
            Connecter Strava
          </Button>
        </div>
      </div>
    </div>
  )
}
