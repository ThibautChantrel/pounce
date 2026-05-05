# Module Race — Documentation technique

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Modèles de données](#2-modèles-de-données)
3. [Cycle de vie d'une course](#3-cycle-de-vie-dune-course)
4. [Inscription et contrôle d'accès](#4-inscription-et-contrôle-daccès)
5. [Résultats et classement](#5-résultats-et-classement)
6. [Format Backyard Ultra](#6-format-backyard-ultra)
7. [Intégration Strava](#7-intégration-strava)
8. [Certification des parcours](#8-certification-des-parcours)
9. [Crons automatiques](#9-crons-automatiques)
10. [Architecture technique](#10-architecture-technique)
11. [Interfaces utilisateur](#11-interfaces-utilisateur)

---

## 1. Vue d'ensemble

Le module Race permet d'organiser et de gérer des courses de trail et ultra-trail. Deux formats sont supportés :

- **ONE_SHOT** — course classique point-à-point ou boucle unique ; le résultat est un temps final.
- **BACKYARD** — format Backyard Ultra où les coureurs complètent des boucles répétées à interval régulier jusqu'à ce qu'ils abandonnent ou manquent le départ d'une boucle.

Les résultats sont alimentés automatiquement via l'API Strava dès qu'un participant synchronise une activité correspondant au parcours de la course. Une saisie manuelle par l'organisateur est également disponible.

---

## 2. Modèles de données

### Race

| Champ                 | Type             | Description                                          |
| --------------------- | ---------------- | ---------------------------------------------------- |
| `id`                  | string (cuid)    | Identifiant                                          |
| `title`               | string           | Nom de la course                                     |
| `description`         | string?          | Description libre                                    |
| `format`              | `RaceFormat`     | ONE_SHOT ou BACKYARD                                 |
| `activityMode`        | `ActivityMode`   | RUN, RIDE, HYBRID, OTHER                             |
| `accessType`          | `RaceAccessType` | PUBLIC_FREE, PUBLIC_VALIDATION, PRIVATE              |
| `accessCode`          | string?          | Code d'accès pour les courses PRIVATE                |
| `maxParticipants`     | int?             | Plafond d'inscriptions (null = illimité)             |
| `startAt` / `endAt`   | DateTime         | Fenêtre temporelle de la course                      |
| `loopDurationMinutes` | int?             | Durée d'une boucle en minutes (BACKYARD uniquement)  |
| `status`              | `RaceStatus`     | DRAFT → PENDING_REVIEW → ACTIVE → CLOSED / CANCELLED |
| `trackId`             | string           | Parcours GPX associé                                 |
| `logoId` / `bannerId` | string?          | Fichiers visuels (via `/api/files/:id`)              |
| `organizerId`         | string           | Créateur de la course                                |

### RaceRegistration

| Champ              | Type                 | Description                         |
| ------------------ | -------------------- | ----------------------------------- |
| `status`           | `RegistrationStatus` | Voir ci-dessous                     |
| `totalTimeSeconds` | int?                 | Temps final en secondes (ONE_SHOT)  |
| `rank`             | int?                 | Classement calculé automatiquement  |
| `stravaActivityId` | string?              | ID de l'activité Strava source      |
| `validationSource` | `ValidationSource`   | AUTO (Strava) ou ORGANIZER (manuel) |
| `finishedAt`       | DateTime?            | Heure d'arrivée calculée            |

**Statuts d'inscription :**

| Statut         | Signification                                                   |
| -------------- | --------------------------------------------------------------- |
| `PENDING`      | En attente de validation par l'organisateur (PUBLIC_VALIDATION) |
| `REGISTERED`   | Inscrit confirmé, pas encore de résultat                        |
| `VALIDATED`    | Résultat enregistré et validé                                   |
| `DNF`          | Did Not Finish — abandon en cours de course                     |
| `DNS`          | Did Not Start — non-partant                                     |
| `DISQUALIFIED` | Disqualifié (motif obligatoire)                                 |

**Contrainte d'unicité :** un utilisateur ne peut avoir qu'une seule inscription par course (`raceId_userId`).

### BackyardLoop

| Champ              | Type               | Description                    |
| ------------------ | ------------------ | ------------------------------ |
| `loopNumber`       | int                | Numéro séquentiel de la boucle |
| `status`           | `LoopStatus`       | PENDING, VALIDATED, MISSED     |
| `timeSeconds`      | int?               | Durée de la boucle             |
| `avgSpeed`         | float?             | Vitesse moyenne (km/h)         |
| `startedAt`        | DateTime?          | Début de la boucle             |
| `completedAt`      | DateTime?          | Fin de la boucle               |
| `validationSource` | `ValidationSource` | AUTO ou ORGANIZER              |

**Contrainte d'unicité :** `registrationId_loopNumber`.

---

## 3. Cycle de vie d'une course

```
Créée par un utilisateur → DRAFT
     ↓ (soumission)
PENDING_REVIEW  → (admin rejette) → CANCELLED
     ↓ (admin valide)
ACTIVE  ──────────────────────────────────────────────────────────────────────┐
     │                                                                          │
     │  Les inscriptions sont ouvertes                                          │
     │  Les résultats Strava arrivent en temps réel                            │
     │                                                                          │
     ↓ (endAt atteint, cron race-close s'exécute)                             │
CLOSED ←─────────────────────────────────────────────────────────────────────┘

Créée par un admin → directement ACTIVE (pas de validation nécessaire)
```

**Transition ACTIVE → CLOSED (cron `/api/cron/race-close`) :**

1. Toutes les races ACTIVE dont `endAt ≤ now` sont fermées.
2. Pour chaque course fermée :
   - Les inscriptions VALIDATED avec `totalTimeSeconds` déclenchent une certification de parcours.
   - Un sync Strava final est lancé pour tous les participants ayant un compte Strava connecté.

---

## 4. Inscription et contrôle d'accès

### Types d'accès

| `accessType`        | Comportement à l'inscription                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| `PUBLIC_FREE`       | Inscription immédiate → statut `REGISTERED`                                    |
| `PUBLIC_VALIDATION` | Inscription en attente → statut `PENDING` jusqu'à validation de l'organisateur |
| `PRIVATE`           | Inscription avec code d'accès requis → `REGISTERED` si code correct            |

### Règles de validation

1. La course doit être `ACTIVE`.
2. Si `maxParticipants` est défini : `registrationCount < maxParticipants`.
3. Pas de double inscription (`raceId_userId` unique).
4. Pour PRIVATE : `accessCode` fourni doit correspondre à `race.accessCode` (comparison exacte).

### Flux d'inscription PUBLIC_VALIDATION

```
Utilisateur clique "Demander à s'inscrire"
     ↓
Statut PENDING créé
     ↓
L'organisateur voit l'inscription dans son dashboard
     ↓
Organisateur clique ✓ → statut passe à REGISTERED
```

### Annulation

Un participant peut annuler son inscription tant que le statut est `PENDING` ou `REGISTERED`. Une inscription `VALIDATED` ne peut pas être annulée (la course est terminée ou le résultat est enregistré).

---

## 5. Résultats et classement

### Format ONE_SHOT

#### Via Strava (automatique)

Dès qu'une activité Strava est synchronisée et que son tracé correspond au parcours de la course (via l'algorithme de matching GPX/polyline), le service `updateRaceFromStravaMatch` :

1. Vérifie que l'utilisateur est inscrit et que la course est ACTIVE.
2. Ignore les inscriptions DNF/DNS/DISQUALIFIED.
3. Si aucun `totalTimeSeconds` n'existe ou si le nouveau temps est **meilleur** (plus rapide) : met à jour la registration.
4. Calcule `finishedAt = startDate + movingTime`.
5. Passe le statut à `VALIDATED` avec `validationSource = AUTO`.
6. Appelle `recalculateRaceRanks()`.

**Règle du meilleur temps** : si un participant effectue plusieurs activités correspondant au parcours, seul le meilleur temps est conservé.

#### Via saisie manuelle (organisateur)

L'organisateur saisit rang + temps (format `HH:MM:SS`) dans le tableau des participants. L'action `setRaceResultAction` :

1. Vérifie que l'appelant est organisateur ou admin.
2. Appelle `setRegistrationResult()` → statut `VALIDATED`, source `ORGANIZER`.
3. Déclenche la certification du parcours.

#### Algorithme de classement

```typescript
// recalculateRaceRanks(raceId)
// 1. Récupère toutes les registrations VALIDATED avec totalTimeSeconds != null
// 2. Les trie par totalTimeSeconds ASC
// 3. Attribue rank = index + 1 (1er, 2ème, 3ème...)
// 4. Met à jour en parallèle avec Promise.all()
```

Le classement est recalculé à chaque nouveau résultat Strava entrant, garantissant un classement en temps réel pendant la course.

### Statistiques affichées

Pour chaque participant (ONE_SHOT) :

- Rang (`#1`, `#2`... avec médailles 🥇🥈🥉 pour le podium)
- Temps final au format `Xh MM'SS"`
- Source de validation (`Auto` via Strava, ou statut normal si manuel)

Classement global :

- Graphique horizontal (Recharts `BarChart`) — couleurs or/argent/bronze pour le podium, couleur primaire pour le reste
- Tableau top 10 avec rang, nom, temps

---

## 6. Format Backyard Ultra

### Principe

Les participants complètent des boucles de durée fixe (`loopDurationMinutes`, typiquement 60 min) en boucle. Chaque boucle doit être commencée avant la fin de la précédente. Le dernier à terminer une boucle quand tous les autres ont abandonné gagne.

### Gestion des boucles

Chaque boucle complétée via Strava crée un `BackyardLoop` :

```
loopNumber = nombre de boucles VALIDATED existantes + 1
startedAt = start_date de l'activité Strava
completedAt = startedAt + movingTime
timeSeconds = movingTime Strava
avgSpeed = average_speed * 3.6
status = VALIDATED
validationSource = AUTO
```

**Protection contre les doublons** : si une `BackyardLoop` avec le même `(registrationId, loopNumber)` existe déjà, l'activité est ignorée.

### Auto-DNF (cron `/api/cron/backyard-dnf`)

Le cron s'exécute chaque minute et vérifie les boucles en statut `PENDING` dont la deadline est dépassée :

```
deadline = loopStartedAt + loopDurationMinutes
         = startedAt (si explicite) OU race.startAt + (loopNumber - 1) * loopDurationMinutes

si deadline <= now:
    loop.status → MISSED
    registration.status → DNF
    registration.statusReason → "Loop X non complété dans les temps"
```

### Affichage

- Nombre de boucles validées avec icône trophée
- Détail des boucles : "Boucle N — XhMM'SS""
- Tri des participants : par nombre de boucles validées décroissant

---

## 7. Intégration Strava

### Sync automatique (webhook / sync manuelle)

Le flux de certification Strava (`processStravaActivity`) est le point d'entrée principal :

```
processStravaActivity(userId, stravaActivityId)
     ↓
fetchStravaActivity → activité Strava complète
     ↓
Vérifie la polyline (summary_polyline) de la carte
     ↓
Pour chaque Track visible avec un fichier GPX :
    matchActivityToTrack(polyline, gpxString)
         ↓ si matched
    Crée TrackCertification (provider='strava')
    updateRaceFromStravaMatch(userId, trackId, activity) ← hook race
         ↓
Vérifie et certifie les défis (checkAndCertifyChallenges)
```

### Sync manuelle (organisateur)

Le bouton **ManualRaceSyncButton** déclenche `manualSyncRaceStravaAction` :

1. Récupère tous les comptes Strava des participants.
2. Pour chaque compte, récupère les activités depuis la dernière certification.
3. Lance `processStravaActivity` pour chaque activité.
4. Retourne `{ syncedActivities, syncedUsers }`.

**Utilité** : si un participant a synchronisé son activité avant de s'inscrire à la course, la sync manuelle permet de rattraper le résultat.

### Arbitrage (comparaison trace)

L'organisateur peut ouvrir un dialog d'arbitrage pour comparer visuellement la trace Strava d'un participant avec le parcours officiel GPX :

```
GET /api/races/:raceId/arbitrage/:registrationId
     ↓
Vérifie que l'appelant est organisateur ou admin
     ↓
Récupère l'activité Strava (registration.stravaActivityId)
Décode la polyline → activityPoints[]
Parse le GPX du parcours → referencePoints[]
     ↓
Retourne { userName, activityName, activityPoints, referencePoints }
```

La carte affiche :

- **Bleu** : parcours officiel GPX
- **Orange** : trace Strava du participant

---

## 8. Certification des parcours

Quand un résultat de course est validé (Strava ou manuel), `certifyRaceRegistration` crée une `TrackCertification` spécifique à la course :

```typescript
TrackCertification.create({
  provider: 'race',
  activityId: registrationId,   // clé unique pour éviter les doublons
  trackId: race.trackId,
  userId,
  totalTime: totalTimeSeconds,
  avgSpeed: distance / (totalTimeSeconds / 3600),  // km/h
  completedAt: finishedAt ?? validatedAt,
  ...
})
```

Ensuite, `checkAndCertifyChallenges` vérifie si le parcours certifié complète des défis (challenges) pour l'utilisateur.

**Idempotence** : la certification est ignorée si une `TrackCertification` avec `(provider='race', activityId=registrationId)` existe déjà.

---

## 9. Crons automatiques

Configurés dans [vercel.json](../vercel.json) et sécurisés par le header `Authorization: Bearer ${CRON_SECRET}`.

| Route                    | Schedule       | Action                                                                           |
| ------------------------ | -------------- | -------------------------------------------------------------------------------- |
| `/api/cron/race-close`   | `*/15 * * * *` | Ferme les courses dont `endAt` est dépassé + sync Strava finale + certifications |
| `/api/cron/backyard-dnf` | `* * * * *`    | Marque les boucles expirées MISSED + DNF les participants                        |

---

## 10. Architecture technique

### Couches

```
Page (RSC)
  ↓ appelle
Server Action (src/actions/race/)
  ↓ appelle
Service (src/server/modules/race/)
  ↓ appelle
Prisma DB (db)
```

### Fichiers clés

| Fichier                                                                                   | Rôle                                                            |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [race.service.ts](../src/server/modules/race/race.service.ts)                             | CRUD courses, liste publique/admin/organisateur                 |
| [race-result.service.ts](../src/server/modules/race/race-result.service.ts)               | Mise à jour résultats depuis Strava + calcul classement         |
| [race-certification.service.ts](../src/server/modules/race/race-certification.service.ts) | Certification parcours depuis résultat de course                |
| [race.actions.ts](../src/actions/race/race.actions.ts)                                    | Server actions CRUD + sync manuelle Strava                      |
| [registration.actions.ts](../src/actions/race/registration.actions.ts)                    | Server actions inscriptions, statuts, résultats                 |
| [race.types.ts](../src/actions/race/race.types.ts)                                        | Types TypeScript partagés (RaceDetail, RegistrationSummary…)    |
| [certification.service.ts](../src/server/modules/strava/certification.service.ts)         | Traitement activité Strava → certification parcours + hook race |

### Routing des pages

| URL                | Rôle                                     | Auth     |
| ------------------ | ---------------------------------------- | -------- |
| `/races`           | Liste des courses ACTIVE                 | Public   |
| `/races/:id`       | Détail course + classement + inscription | Public   |
| `/races/create`    | Formulaire de création                   | Connecté |
| `/profile/races`   | Dashboard organisateur                   | Connecté |
| `/admin/races`     | Liste admin avec filtres                 | Admin    |
| `/admin/races/:id` | Validation/rejet admin                   | Admin    |

---

## 11. Interfaces utilisateur

### Vue détail d'une course (`RaceDetailView`)

Accessible à tous. Affiche :

- Banner + logo + badges format (Backyard / Course) + badge Privée
- Carte GPX interactive du parcours + badges distance/dénivelé
- Description
- Sidebar : dates, nb participants, durée boucle (Backyard)
- **Mon inscription** : statut coloré + bouton d'annulation si PENDING/REGISTERED
- **S'inscrire** : champ code si PRIVATE, bouton adapté selon accessType
- **Classement** : graphique + top 10 (si résultats disponibles)
- **Tableau des participants** (avec actions organisateur si isOrganizer)

### Tableau des participants (`RaceParticipantsTable`)

| Colonne                | ONE_SHOT   | BACKYARD |
| ---------------------- | ---------- | -------- |
| Rang                   | ✓ (🥇🥈🥉) | —        |
| Nom                    | ✓          | ✓        |
| Temps                  | ✓          | —        |
| Boucles                | —          | ✓        |
| Statut                 | ✓          | ✓        |
| Actions (organisateur) | ✓          | ✓        |

**Actions organisateur :**

- ✓ : valider une inscription PENDING → REGISTERED
- **Résultat** : saisir rang + temps manuellement (ONE_SHOT uniquement)
- **Map** : ouvrir l'arbitrage Strava (si stravaActivityId présent)
- **DNF** / **DNS** / **DQ** : changement de statut avec dialog de confirmation

**Confirmation avant action irréversible :**

- DNF/DNS : message "Cette action est définitive"
- DQ : motif obligatoire + message "définitive"

### Dashboard organisateur (`OrganizerRacesDashboard`)

Liste des courses de l'organisateur avec :

- Statut coloré + motif de rejet si CANCELLED
- Boutons Voir, Modifier, Supprimer
- Panneau extensible (ACTIVE uniquement) : liste des participants avec actions rapides + ManualRaceSyncButton
