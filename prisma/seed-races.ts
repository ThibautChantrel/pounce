/**
 * Seed script — données de démonstration pour le module Race
 * Run: npx tsx prisma/seed-races.ts
 */

import {
  PrismaClient,
  ActivityMode,
  RaceFormat,
  RaceAccessType,
  RaceStatus,
  RegistrationStatus,
  LoopStatus,
  ValidationSource,
} from '@prisma/client'

const db = new PrismaClient()

// ─── IDs constants ───────────────────────────────────────────────────────────

const ORGANIZER_ID = 'cml17ls52000cgqy07et16c2g' // tibox (admin)
const ME_ID = 'cml17kn3o000bgqy01024ctir' // titou

const TRACK_METRO12 = 'cmkihxadd000213zo7fa1cl3h' // 17.9km 180m
const TRACK_METRO8 = 'cmlxvqwr70003wft9cbls4e71' // 26km 289m
const TRACK_METRO2 = 'cmkqm1te30000ure5iis8r3nb' // 13km 100m
const TRACK_METRO14 = 'cmm6gkdpp0013ggejjrpuxop1' // 30km 360m
const TRACK_METRO1 = 'cmmgfzz5y000w1x1rfhaj37ka' // 18km 140m
const TRACK_METRO9 = 'cmlxw4rq40007wft9ansceuqe' // 21km 155m

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3600 * 1000)
}
function hoursFromNow(n: number) {
  return new Date(Date.now() + n * 3600 * 1000)
}

// BPM réalistes par participant et par boucle (fatigue progressive)
function bpm(base: number, loopNumber: number, variance = 0) {
  const fatigue = (loopNumber - 1) * 2
  const avg = Math.round(base + fatigue + variance)
  const max = Math.round(avg + 10 + Math.random() * 10)
  return { heartRateAvg: avg, heartRateMax: max }
}

// ─── Fake users ───────────────────────────────────────────────────────────────

const FAKE_USERS = [
  {
    id: 'seed_user_marie',
    email: 'marie.dupont@seed.test',
    pseudo: 'mariedupont',
    firstName: 'Marie',
    lastName: 'Dupont',
  },
  {
    id: 'seed_user_paul',
    email: 'paul.martin@seed.test',
    pseudo: 'paulrun',
    firstName: 'Paul',
    lastName: 'Martin',
  },
  {
    id: 'seed_user_sophie',
    email: 'sophie.bernard@seed.test',
    pseudo: 'sophieb',
    firstName: 'Sophie',
    lastName: 'Bernard',
  },
  {
    id: 'seed_user_lucas',
    email: 'lucas.petit@seed.test',
    pseudo: 'lpetit',
    firstName: 'Lucas',
    lastName: 'Petit',
  },
  {
    id: 'seed_user_emma',
    email: 'emma.roux@seed.test',
    pseudo: 'emmaroux',
    firstName: 'Emma',
    lastName: 'Roux',
  },
  {
    id: 'seed_user_tom',
    email: 'tom.girard@seed.test',
    pseudo: 'tomg',
    firstName: 'Tom',
    lastName: 'Girard',
  },
  {
    id: 'seed_user_camille',
    email: 'camille.moreau@seed.test',
    pseudo: 'camille',
    firstName: 'Camille',
    lastName: 'Moreau',
  },
  {
    id: 'seed_user_alex',
    email: 'alex.leroy@seed.test',
    pseudo: 'alexl',
    firstName: 'Alex',
    lastName: 'Leroy',
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Création des utilisateurs fictifs...')
  for (const u of FAKE_USERS) {
    await db.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        pseudo: u.pseudo,
        firstName: u.firstName,
        lastName: u.lastName,
        isVerified: true,
      },
    })
  }

  // ─── Race 1 : ONE_SHOT CLOSED — Grand Trail du Métro 8 ──────────────────

  console.log('🏁 Race 1 : ONE_SHOT CLOSED — Grand Trail du Métro 8...')

  const race1 = await db.race.upsert({
    where: { id: 'seed_race_1' },
    update: {},
    create: {
      id: 'seed_race_1',
      title: 'Grand Trail du Métro 8',
      description: `La course mythique du Métro 8 — 26 km et 289m de dénivelé à travers la ville. Un parcours exigeant qui longe les stations de la ligne 8 de bout en bout.

Ouvert à tous les coureurs confirmés, cette édition réunit les meilleurs traileurs de la région. Résultats validés via Strava, classement en temps réel.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.ONE_SHOT,
      accessType: RaceAccessType.PUBLIC_FREE,
      maxParticipants: 50,
      startAt: daysAgo(14),
      endAt: daysAgo(7),
      status: RaceStatus.CLOSED,
      trackId: TRACK_METRO8,
      organizerId: ORGANIZER_ID,
      adminValidatedAt: daysAgo(20),
      adminValidatedById: ORGANIZER_ID,
    },
  })

  const race1Results = [
    {
      userId: 'seed_user_emma',
      totalTime: 8100,
      rank: 1,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_tom',
      totalTime: 9120,
      rank: 2,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_camille',
      totalTime: 9900,
      rank: 3,
      source: ValidationSource.AUTO,
    },
    { userId: ME_ID, totalTime: 10920, rank: 4, source: ValidationSource.AUTO },
    {
      userId: 'seed_user_marie',
      totalTime: 11700,
      rank: 5,
      source: ValidationSource.ORGANIZER,
    },
    {
      userId: 'seed_user_paul',
      totalTime: 12480,
      rank: 6,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_sophie',
      totalTime: null,
      rank: null,
      source: null,
      status: RegistrationStatus.DNF,
    },
    {
      userId: 'seed_user_lucas',
      totalTime: null,
      rank: null,
      source: null,
      status: RegistrationStatus.DNS,
    },
    {
      userId: 'seed_user_alex',
      totalTime: null,
      rank: null,
      source: null,
      status: RegistrationStatus.DISQUALIFIED,
      reason: 'Ravitaillement non autorisé',
    },
  ]

  for (const r of race1Results) {
    const status =
      r.status ??
      (r.totalTime
        ? RegistrationStatus.VALIDATED
        : RegistrationStatus.REGISTERED)
    await db.raceRegistration.upsert({
      where: { raceId_userId: { raceId: race1.id, userId: r.userId } },
      update: {},
      create: {
        raceId: race1.id,
        userId: r.userId,
        status,
        registeredAt: daysAgo(21),
        validatedAt: r.totalTime ? daysAgo(14) : undefined,
        finishedAt: r.totalTime
          ? new Date(race1.startAt.getTime() + r.totalTime * 1000)
          : undefined,
        totalTimeSeconds: r.totalTime ?? undefined,
        rank: r.rank ?? undefined,
        validationSource: r.source ?? undefined,
        stravaActivityId:
          r.source === ValidationSource.AUTO
            ? `strava_${r.userId}_race1`
            : undefined,
        statusReason: r.reason ?? undefined,
      },
    })
  }

  // ─── Race 2 : ONE_SHOT ACTIVE — Ultra du Métro 14 ───────────────────────

  console.log('🏃 Race 2 : ONE_SHOT ACTIVE — Ultra du Métro 14...')

  const race2 = await db.race.upsert({
    where: { id: 'seed_race_2' },
    update: {},
    create: {
      id: 'seed_race_2',
      title: 'Ultra du Métro 14 — Édition 2026',
      description: `30 km et 360m D+ sur le tracé complet de la ligne 14. Le parcours le plus long et le plus exigeant du catalogue Métro Trail.

Inscriptions sur validation — l'organisateur vérifie les profils avant d'accepter. Résultats en direct via synchronisation Strava automatique.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.ONE_SHOT,
      accessType: RaceAccessType.PUBLIC_VALIDATION,
      maxParticipants: 30,
      startAt: daysAgo(2),
      endAt: daysFromNow(5),
      status: RaceStatus.ACTIVE,
      trackId: TRACK_METRO14,
      organizerId: ORGANIZER_ID,
      adminValidatedAt: daysAgo(10),
      adminValidatedById: ORGANIZER_ID,
    },
  })

  const race2Registrations = [
    {
      userId: ME_ID,
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_emma',
      status: RegistrationStatus.VALIDATED,
      totalTime: 9540,
      rank: 1,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_tom',
      status: RegistrationStatus.VALIDATED,
      totalTime: 10260,
      rank: 2,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_camille',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_marie',
      status: RegistrationStatus.VALIDATED,
      totalTime: 11880,
      rank: 3,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_lucas',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_paul',
      status: RegistrationStatus.PENDING,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_alex',
      status: RegistrationStatus.PENDING,
      totalTime: null,
      rank: null,
    },
  ]

  for (const r of race2Registrations) {
    await db.raceRegistration.upsert({
      where: { raceId_userId: { raceId: race2.id, userId: r.userId } },
      update: {},
      create: {
        raceId: race2.id,
        userId: r.userId,
        status: r.status,
        registeredAt: daysAgo(8),
        validatedAt:
          r.status !== RegistrationStatus.PENDING ? daysAgo(7) : undefined,
        totalTimeSeconds: r.totalTime ?? undefined,
        rank: r.rank ?? undefined,
        validationSource:
          (r as { source?: ValidationSource }).source ?? undefined,
        stravaActivityId:
          (r as { source?: ValidationSource }).source === ValidationSource.AUTO
            ? `strava_${r.userId}_race2`
            : undefined,
        finishedAt: r.totalTime
          ? new Date(race2.startAt.getTime() + r.totalTime * 1000)
          : undefined,
      },
    })
  }

  // ─── Race 3 : BACKYARD ACTIVE — Backyard du Métro 2 ────────────────────

  console.log('🔄 Race 3 : BACKYARD ACTIVE — Backyard du Métro 2...')

  const race3Start = hoursAgo(6)
  const race3 = await db.race.upsert({
    where: { id: 'seed_race_3' },
    update: {},
    create: {
      id: 'seed_race_3',
      title: 'Backyard du Métro 2 — Nuit Blanche',
      description: `Format Backyard Ultra sur la ligne 2 : 13 km par boucle, toutes les heures. Qui tiendra le plus longtemps ?

Course privée — code d'accès requis. Les participants doivent synchroniser Strava pour valider leurs boucles automatiquement.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.BACKYARD,
      accessType: RaceAccessType.PRIVATE,
      accessCode: 'METRO2026',
      maxParticipants: 20,
      startAt: race3Start,
      endAt: hoursFromNow(18),
      loopDurationMinutes: 60,
      status: RaceStatus.ACTIVE,
      trackId: TRACK_METRO2,
      organizerId: ORGANIZER_ID,
      adminValidatedAt: daysAgo(5),
      adminValidatedById: ORGANIZER_ID,
    },
  })

  // Profils BPM de base par participant (variation naturelle)
  const BACKYARD3_PARTICIPANTS = [
    {
      userId: 'seed_user_marie',
      status: RegistrationStatus.REGISTERED,
      bpmBase: 152,
      loops: [
        { n: 1, time: 3180, speed: 14.7 },
        { n: 2, time: 3240, speed: 14.4 },
        { n: 3, time: 3300, speed: 14.2 },
        { n: 4, time: 3360, speed: 13.9 },
        { n: 5, time: 3420, speed: 13.7 },
      ],
    },
    {
      userId: 'seed_user_paul',
      status: RegistrationStatus.REGISTERED,
      bpmBase: 158,
      loops: [
        { n: 1, time: 3360, speed: 13.9 },
        { n: 2, time: 3420, speed: 13.7 },
        { n: 3, time: 3480, speed: 13.4 },
        { n: 4, time: 3540, speed: 13.2 },
      ],
    },
    {
      userId: ME_ID,
      status: RegistrationStatus.DNF,
      statusReason: 'Loop 4 non complété dans les temps',
      bpmBase: 163,
      loops: [
        { n: 1, time: 3240, speed: 14.4 },
        { n: 2, time: 3360, speed: 13.9 },
        { n: 3, time: 3480, speed: 13.4 },
      ],
    },
    {
      userId: 'seed_user_sophie',
      status: RegistrationStatus.DNF,
      statusReason: 'Loop 2 non complété dans les temps',
      bpmBase: 170,
      loops: [{ n: 1, time: 3540, speed: 13.2 }],
    },
    {
      userId: 'seed_user_lucas',
      status: RegistrationStatus.REGISTERED,
      bpmBase: 148,
      loops: [
        { n: 1, time: 3120, speed: 15.0 },
        { n: 2, time: 3180, speed: 14.7 },
        { n: 3, time: 3240, speed: 14.4 },
        { n: 4, time: 3300, speed: 14.2 },
        { n: 5, time: 3360, speed: 13.9 },
      ],
    },
    {
      userId: 'seed_user_tom',
      status: RegistrationStatus.DNS,
      bpmBase: 160,
      loops: [],
    },
  ]

  for (const p of BACKYARD3_PARTICIPANTS) {
    const reg = await db.raceRegistration.upsert({
      where: { raceId_userId: { raceId: race3.id, userId: p.userId } },
      update: {},
      create: {
        raceId: race3.id,
        userId: p.userId,
        status: p.status,
        registeredAt: daysAgo(5),
        validatedAt: daysAgo(4),
        statusReason: p.statusReason ?? undefined,
      },
    })

    for (const loop of p.loops) {
      const loopStart = new Date(
        race3Start.getTime() + (loop.n - 1) * 60 * 60 * 1000
      )
      const { heartRateAvg, heartRateMax } = bpm(p.bpmBase, loop.n)
      await db.backyardLoop.upsert({
        where: {
          registrationId_loopNumber: {
            registrationId: reg.id,
            loopNumber: loop.n,
          },
        },
        update: {},
        create: {
          registrationId: reg.id,
          loopNumber: loop.n,
          startedAt: loopStart,
          completedAt: new Date(loopStart.getTime() + loop.time * 1000),
          timeSeconds: loop.time,
          avgSpeed: loop.speed,
          heartRateAvg,
          heartRateMax,
          status: LoopStatus.VALIDATED,
          validationSource: ValidationSource.AUTO,
          validatedAt: new Date(loopStart.getTime() + loop.time * 1000),
          stravaActivityId: `strava_${p.userId}_race3_loop${loop.n}`,
        },
      })
    }
  }

  // ─── Race 4 : ONE_SHOT ACTIVE — Trail du Métro 12 ───────────────────────

  console.log('🌟 Race 4 : ONE_SHOT ACTIVE — Trail du Métro 12...')

  const race4 = await db.race.upsert({
    where: { id: 'seed_race_4' },
    update: {},
    create: {
      id: 'seed_race_4',
      title: 'Trail du Métro 12 — Printemps',
      description: `La course printanière sur la ligne 12 — 17.9 km et 180m D+. Un classique accessible à tous les niveaux.

Inscriptions libres, résultats via Strava. Idéal pour débuter le trail urbain.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.ONE_SHOT,
      accessType: RaceAccessType.PUBLIC_FREE,
      maxParticipants: null,
      startAt: daysAgo(1),
      endAt: daysFromNow(3),
      status: RaceStatus.ACTIVE,
      trackId: TRACK_METRO12,
      organizerId: ORGANIZER_ID,
      adminValidatedAt: daysAgo(7),
      adminValidatedById: ORGANIZER_ID,
    },
  })

  const race4Registrations = [
    {
      userId: ME_ID,
      status: RegistrationStatus.VALIDATED,
      totalTime: 6300,
      rank: 2,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_emma',
      status: RegistrationStatus.VALIDATED,
      totalTime: 5760,
      rank: 1,
      source: ValidationSource.AUTO,
    },
    {
      userId: 'seed_user_tom',
      status: RegistrationStatus.VALIDATED,
      totalTime: 6840,
      rank: 3,
      source: ValidationSource.ORGANIZER,
    },
    {
      userId: 'seed_user_camille',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_paul',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_sophie',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
    {
      userId: 'seed_user_alex',
      status: RegistrationStatus.REGISTERED,
      totalTime: null,
      rank: null,
    },
  ]

  for (const r of race4Registrations) {
    await db.raceRegistration.upsert({
      where: { raceId_userId: { raceId: race4.id, userId: r.userId } },
      update: {},
      create: {
        raceId: race4.id,
        userId: r.userId,
        status: r.status,
        registeredAt: daysAgo(6),
        validatedAt:
          r.status === RegistrationStatus.VALIDATED ? daysAgo(1) : undefined,
        totalTimeSeconds: r.totalTime ?? undefined,
        rank: r.rank ?? undefined,
        validationSource:
          (r as { source?: ValidationSource }).source ?? undefined,
        stravaActivityId:
          (r as { source?: ValidationSource }).source === ValidationSource.AUTO
            ? `strava_${r.userId}_race4`
            : undefined,
        finishedAt: r.totalTime
          ? new Date(race4.startAt.getTime() + r.totalTime * 1000)
          : undefined,
      },
    })
  }

  // ─── Race 5 : PENDING_REVIEW — Challenge du Métro 9 ─────────────────────

  console.log('⏳ Race 5 : PENDING_REVIEW — Challenge du Métro 9...')

  await db.race.upsert({
    where: { id: 'seed_race_5' },
    update: {},
    create: {
      id: 'seed_race_5',
      title: 'Challenge du Métro 9 — Été 2026',
      description: `21 km sur le tracé de la ligne 9, prévu pour l'été 2026. Inscriptions ouvertes dès validation par l'équipe.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.ONE_SHOT,
      accessType: RaceAccessType.PUBLIC_FREE,
      maxParticipants: 40,
      startAt: daysFromNow(45),
      endAt: daysFromNow(47),
      status: RaceStatus.PENDING_REVIEW,
      trackId: TRACK_METRO9,
      organizerId: ORGANIZER_ID,
    },
  })

  // ─── Race 6 : DRAFT — Trail du Métro 1 ──────────────────────────────────

  console.log('📝 Race 6 : DRAFT — Trail du Métro 1...')

  await db.race.upsert({
    where: { id: 'seed_race_6' },
    update: {},
    create: {
      id: 'seed_race_6',
      title: 'Trail du Métro 1 — Automne 2026',
      description: `En cours de préparation. 18 km sur la mythique ligne 1, traversant Paris d'est en ouest.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.ONE_SHOT,
      accessType: RaceAccessType.PUBLIC_FREE,
      maxParticipants: 60,
      startAt: daysFromNow(120),
      endAt: daysFromNow(122),
      status: RaceStatus.DRAFT,
      trackId: TRACK_METRO1,
      organizerId: ORGANIZER_ID,
    },
  })

  // ─── Race 7 : BACKYARD CLOSED — Backyard du Métro 12 ───────────────────

  console.log('🏆 Race 7 : BACKYARD CLOSED — Backyard du Métro 12...')

  const race7Start = daysAgo(10)
  const race7 = await db.race.upsert({
    where: { id: 'seed_race_7' },
    update: {},
    create: {
      id: 'seed_race_7',
      title: 'Backyard du Métro 12 — Édition Hivernale',
      description: `L'épreuve hivernale en format Backyard Ultra. 17.9 km par boucle, départ toutes les heures. Cette édition a vu 8 boucles complétées par le vainqueur.`,
      activityMode: ActivityMode.RUN,
      format: RaceFormat.BACKYARD,
      accessType: RaceAccessType.PUBLIC_FREE,
      maxParticipants: 15,
      startAt: race7Start,
      endAt: daysAgo(9),
      loopDurationMinutes: 60,
      status: RaceStatus.CLOSED,
      trackId: TRACK_METRO12,
      organizerId: ORGANIZER_ID,
      adminValidatedAt: daysAgo(15),
      adminValidatedById: ORGANIZER_ID,
    },
  })

  // [loopCount, bpmBase] par participant
  const BACKYARD7_PARTICIPANTS = [
    {
      userId: 'seed_user_lucas',
      loops: 8,
      bpmBase: 145,
      status: RegistrationStatus.VALIDATED,
    },
    {
      userId: 'seed_user_emma',
      loops: 6,
      bpmBase: 155,
      status: RegistrationStatus.DNF,
    },
    { userId: ME_ID, loops: 5, bpmBase: 162, status: RegistrationStatus.DNF },
    {
      userId: 'seed_user_paul',
      loops: 4,
      bpmBase: 168,
      status: RegistrationStatus.DNF,
    },
    {
      userId: 'seed_user_camille',
      loops: 3,
      bpmBase: 172,
      status: RegistrationStatus.DNF,
    },
    {
      userId: 'seed_user_marie',
      loops: 2,
      bpmBase: 178,
      status: RegistrationStatus.DNF,
    },
  ]

  for (const p of BACKYARD7_PARTICIPANTS) {
    const reg = await db.raceRegistration.upsert({
      where: { raceId_userId: { raceId: race7.id, userId: p.userId } },
      update: {},
      create: {
        raceId: race7.id,
        userId: p.userId,
        status: p.status,
        registeredAt: daysAgo(15),
        validatedAt: daysAgo(14),
        statusReason:
          p.status === RegistrationStatus.DNF
            ? `Loop ${p.loops + 1} non complété dans les temps`
            : undefined,
      },
    })

    for (let n = 1; n <= p.loops; n++) {
      // Légèrement plus lent à chaque boucle (+30s)
      const timeSeconds = 3240 + (n - 1) * 30 + Math.round(Math.random() * 60)
      const avgSpeed = Math.round((17.9 / (timeSeconds / 3600)) * 10) / 10
      const loopStart = new Date(
        race7Start.getTime() + (n - 1) * 60 * 60 * 1000
      )
      const { heartRateAvg, heartRateMax } = bpm(p.bpmBase, n)
      await db.backyardLoop.upsert({
        where: {
          registrationId_loopNumber: { registrationId: reg.id, loopNumber: n },
        },
        update: {},
        create: {
          registrationId: reg.id,
          loopNumber: n,
          startedAt: loopStart,
          completedAt: new Date(loopStart.getTime() + timeSeconds * 1000),
          timeSeconds,
          avgSpeed,
          heartRateAvg,
          heartRateMax,
          status: LoopStatus.VALIDATED,
          validationSource: ValidationSource.AUTO,
          validatedAt: new Date(loopStart.getTime() + timeSeconds * 1000),
          stravaActivityId: `strava_${p.userId}_race7_loop${n}`,
        },
      })
    }
  }

  console.log('\n✅ Seed terminé !')
  console.log(
    '   Race 1 : CLOSED — Grand Trail du Métro 8 (8 participants, classement complet)'
  )
  console.log(
    '   Race 2 : ACTIVE — Ultra du Métro 14 (8 inscrits, 3 résultats Strava en direct)'
  )
  console.log(
    '   Race 3 : ACTIVE BACKYARD — Backyard du Métro 2 (6 participants, en cours)'
  )
  console.log(
    '   Race 4 : ACTIVE — Trail du Métro 12 (7 inscrits, 3 résultats)'
  )
  console.log(
    '   Race 5 : PENDING_REVIEW — Challenge du Métro 9 (en attente admin)'
  )
  console.log('   Race 6 : DRAFT — Trail du Métro 1 (brouillon)')
  console.log(
    '   Race 7 : CLOSED BACKYARD — Backyard du Métro 12 (6 participants, 8 boucles max)'
  )
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
