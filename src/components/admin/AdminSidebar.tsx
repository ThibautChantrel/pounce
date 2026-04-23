'use client'

import { usePathname } from 'next/navigation'
import { Link } from '@/navigation'
import {
  Users,
  LogOut,
  FileText,
  Locate,
  Waypoints,
  Swords,
  MessageSquare,
  Tag,
  MapPinned,
  Award,
  PawPrint,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type NavItem = {
  href: string
  icon: React.ReactNode
  label: string
}

type NavGroup = {
  label: string
  items: NavItem[]
}

function AdminNavLink({ href, icon, label }: NavItem) {
  const pathname = usePathname()
  const isActive = pathname.includes(href)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

export default function AdminSidebar() {
  const t = useTranslations('Admin')

  const groups: NavGroup[] = [
    {
      label: t('Navbar.groupContent'),
      items: [
        {
          href: '/admin/tracks',
          icon: <Waypoints size={16} />,
          label: t('Navbar.tracks'),
        },
        {
          href: '/admin/challenges',
          icon: <Swords size={16} />,
          label: t('Navbar.challenges'),
        },
        {
          href: '/admin/categories',
          icon: <Tag size={16} />,
          label: t('Navbar.categories'),
        },
        {
          href: '/admin/pois',
          icon: <Locate size={16} />,
          label: t('Navbar.pois'),
        },
        {
          href: '/admin/poi-types',
          icon: <MapPinned size={16} />,
          label: t('Navbar.poiTypes'),
        },
      ],
    },
    {
      label: t('Navbar.groupCommunity'),
      items: [
        {
          href: '/admin/users',
          icon: <Users size={16} />,
          label: t('Navbar.users'),
        },
        {
          href: '/admin/feedbacks',
          icon: <MessageSquare size={16} />,
          label: t('Navbar.feedbacks'),
        },
      ],
    },
    {
      label: t('Navbar.groupStrava'),
      items: [
        {
          href: '/admin/track-certifications',
          icon: <Award size={16} />,
          label: t('Navbar.trackCertifications'),
        },
        {
          href: '/admin/challenge-certifications',
          icon: <Award size={16} />,
          label: t('Navbar.challengeCertifications'),
        },
        {
          href: '/admin/strava-syncs',
          icon: <RefreshCw size={16} />,
          label: t('Navbar.stravaSyncs'),
        },
      ],
    },
    {
      label: t('Navbar.groupMedia'),
      items: [
        {
          href: '/admin/files',
          icon: <FileText size={16} />,
          label: t('Navbar.files'),
        },
      ],
    },
  ]

  return (
    <aside className="w-60 bg-card border-r hidden md:flex flex-col">
      {/* Header */}
      <div className="p-5 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <PawPrint size={16} className="text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight truncate">
            {t('Panel.title')}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {t('Panel.subtitle')}
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <AdminNavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={16} />
          {t('Navbar.backToSite')}
        </Link>
      </div>
    </aside>
  )
}
