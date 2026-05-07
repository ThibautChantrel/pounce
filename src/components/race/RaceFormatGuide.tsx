'use client'

import { useState } from 'react'
import {
  HelpCircle,
  X,
  Flag,
  UserCheck,
  Zap,
  RefreshCw,
  Clock,
  Trophy,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      <div className="text-sm text-muted-foreground space-y-1 pl-6">
        {children}
      </div>
    </div>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <p className="before:content-['·'] before:mr-2 before:text-primary">
      {children}
    </p>
  )
}

export function RaceFormatGuide() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Comprendre le format course
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Flag className="w-4 h-4 text-primary" />
              Comprendre le format course
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <Section
              icon={<Flag className="w-4 h-4" />}
              title="Création d'une course"
            >
              <Item>
                Une course est créée en statut <strong>Brouillon</strong> puis
                soumise à validation admin.
              </Item>
              <Item>
                Une fois validée, elle passe en statut <strong>Active</strong> :
                les inscriptions s&apos;ouvrent.
              </Item>
              <Item>
                À la date de début, un cron passe automatiquement la course{' '}
                <strong>En cours</strong>.
              </Item>
              <Item>
                À la date de fin, la course est <strong>Clôturée</strong> et les
                certifications sont calculées.
              </Item>
            </Section>

            <Section
              icon={<UserCheck className="w-4 h-4" />}
              title="Inscription"
            >
              <Item>
                Les inscriptions ne sont acceptées que pendant la phase{' '}
                <strong>Active</strong> (avant le départ).
              </Item>
              <Item>
                <strong>Publique libre</strong> : tout le monde peut
                s&apos;inscrire sans validation.
              </Item>
              <Item>
                <strong>Sur validation</strong> : l&apos;organisateur accepte ou
                refuse chaque demande.
              </Item>
              <Item>
                <strong>Privée</strong> : un code d&apos;accès est requis pour
                s&apos;inscrire.
              </Item>
            </Section>

            <Section icon={<Zap className="w-4 h-4" />} title="Format ONE_SHOT">
              <Item>
                Un seul parcours à réaliser ; le résultat est un temps final en
                secondes.
              </Item>
              <Item>
                Si la course est <strong>Publique libre</strong>, les
                participants Strava sont automatiquement inscrits dès
                qu&apos;ils valident le parcours — pas d&apos;inscription
                manuelle nécessaire.
              </Item>
              <Item>
                Un participant peut améliorer son temps : seul le meilleur est
                conservé.
              </Item>
              <Item>
                À la clôture, un classement final est calculé par temps
                croissant.
              </Item>
            </Section>

            <Section
              icon={<RefreshCw className="w-4 h-4" />}
              title="Format BACKYARD"
            >
              <Item>
                Les coureurs répètent une boucle à intervalle régulier (ex : 4
                h) jusqu&apos;à l&apos;abandon ou le DNF automatique.
              </Item>
              <Item>
                La durée totale doit être un multiple exact de la durée des
                boucles.
              </Item>
              <Item>
                Le numéro de boucle est déduit du moment de départ de
                l&apos;activité — le traitement est déterministe même si les
                syncs arrivent dans le désordre.
              </Item>
              <Item>
                Si un coureur rate sa deadline de boucle, un cron le marque{' '}
                <strong>DNF</strong> automatiquement.
              </Item>
            </Section>

            <Section
              icon={<Cpu className="w-4 h-4" />}
              title="Synchronisation Strava"
            >
              <Item>
                La synchro Strava ne s&apos;applique que lorsque la course est{' '}
                <strong>En cours</strong>.
              </Item>
              <Item>
                Quand un participant enregistre une activité Strava
                correspondant au parcours, elle est traitée automatiquement.
              </Item>
              <Item>
                Pour ONE_SHOT : l&apos;activité doit se terminer avant la fin de
                la course.
              </Item>
              <Item>
                Pour BACKYARD : l&apos;activité doit se terminer avant la
                deadline de la boucle concernée.
              </Item>
              <Item>
                Les doublons de sync (même activité Strava) sont ignorés grâce à
                une contrainte unique.
              </Item>
            </Section>

            <Section
              icon={<Clock className="w-4 h-4" />}
              title="Tâches automatiques (crons)"
            >
              <Item>
                <strong>race-start</strong> : passe les courses ACTIVE → EN
                COURS quand la date de début est atteinte.
              </Item>
              <Item>
                <strong>backyard-dnf</strong> : marque DNF les coureurs BACKYARD
                qui ont raté leur boucle.
              </Item>
              <Item>
                <strong>race-close</strong> : clôture les courses EN COURS dont
                la date de fin est dépassée et déclenche la certification
                finale.
              </Item>
            </Section>

            <Section
              icon={<Trophy className="w-4 h-4" />}
              title="Certification"
            >
              <Item>
                À la clôture, chaque participant VALIDATED est certifié : une
                trace est ajoutée à son profil.
              </Item>
              <Item>
                Pour ONE_SHOT : la certification nécessite un temps final
                renseigné.
              </Item>
              <Item>
                Pour BACKYARD : la certification nécessite au moins une boucle
                validée.
              </Item>
              <Item>
                Le temps total BACKYARD est la somme des temps de chaque boucle
                ; la distance est le nombre de boucles × la distance du
                parcours.
              </Item>
            </Section>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
