
# ufc-data-scraper

A web scraper that fetches fighters, events, rankings, records, and detailed fight statistics from UFC.com.

## Installation

```bash
npm install ufc-data-scraper
```

## Usage

```typescript
// Import specific scrapers
import { getEvent } from 'ufc-data-scraper/scrapers/event'
import { getFighter } from 'ufc-data-scraper/scrapers/fighter'
import { getRankings } from 'ufc-data-scraper/scrapers/rankings'

// Get UFC event fights
const event = await getEvent('ufc-321')
console.log(event[0].red.name) // "Tom Aspinall"

// Get fighter details
const fighter = await getFighter('petr-yan')
console.log(fighter.info.name) // "Petr Yan"
console.log(fighter.stats.record) // { wins: 19, losses: 5, draws: 0 }

// Get current rankings
const rankings = await getRankings()
console.log(rankings.mensPoundForPound[0]) // { rank: 1, name: "Islam Makhachev", slug: "islam-makhachev" }
```

## API

### Functions

#### getEvent(slug: string): Promise&lt;FightCard&gt;

Retrieves complete fight card for a UFC event from https://www.ufc.com/event/.

```typescript
// Returns:
[
  {
    fightId: 12277,
    boutType: 'Heavyweight Title Bout',
    red: {
      name: 'Tom Aspinall',
      rank: 'C',
      odds: '-355',
      country: 'England',
      outcome: 'no contest',
      slug: 'tom-aspinall',
    },
    blue: {
      name: 'Ciryl Gane',
      rank: 1,
      odds: '+280',
      country: 'France',
      outcome: 'no contest',
      slug: 'ciryl-gane',
    },
    result: { method: 'Could Not Continue', round: 1, time: '4:35' },
    awards: null,
  },
  // ... more fights
]
```

#### getPastEvents(pageNumber?: number): Promise&lt;EventList&gt;

Retrieves the past 8 UFC events from https://www.ufc.com/events?page=, ordered from latest to oldest.

```typescript
// Returns:
[
  {
    event: {
      name: 'UFC 322',
      headline: 'Della Maddalena vs Makhachev',
      date: '2025-11-16',
      slug: 'ufc-322'
    },
    mainCard: { dateTime: '2025-11-16T03:00:00.000Z', unix: 1763262000 },
    prelim: { dateTime: '2025-11-16T01:00:00.000Z', unix: 1763254800 },
    location: {
      venue: 'Madison Square Garden',
      locality: 'New York',
      administrativeArea: 'NY',
      country: 'United States',
    },
  },
  // ... more events
]
```

#### getUpcomingEvents(): Promise&lt;EventList&gt;

Retrieves all upcoming UFC events from https://www.ufc.com/events#events-list-upcoming.

```typescript
// Returns:
[
  {
    event: {
      name: 'UFC Fight Night',
      headline: 'Tsarukyan vs Hooker',
      date: '2025-11-22',
      slug: 'ufc-fight-night-november-22-2025'
    },
    mainCard: { dateTime: '2025-11-22T18:00:00.000Z', unix: 1763834400 },
    prelim: { dateTime: '2025-11-22T15:00:00.000Z', unix: 1763823600 },
    location: {
      venue: 'ABHA Arena',
      locality: 'Doha',
      administrativeArea: null,
      country: 'Qatar',
    },
  },
  // ... more events
]
```

#### getFight(slug: string, fightId: number): Promise&lt;FightStats&gt;

Retrieves detailed statistics of a single fight from https://www.ufc.com/event/.

```typescript
// Returns:
{
  red: {
    fightOverview: {
      fullFight: {
        totalStrikes: { landed: 89, percent: 0.29, attempted: null },
        takedowns: { landed: 0, percent: null, attempted: null },
        submissionAttempts: { landed: 0, percent: null, attempted: null },
        reversals: { landed: 0, percent: null, attempted: null },
        significantStrikes: { landed: 87, percent: null, attempted: null },
        knockdowns: { landed: 0, percent: null, attempted: null }
      },
      rounds: [
        {
          round: 1,
          totalStrikes: { landed: 14, percent: 0.21, attempted: null },
          takedowns: { landed: 0, percent: null, attempted: null },
          submissionAttempts: { landed: 0, percent: null, attempted: null },
          reversals: { landed: 0, percent: null, attempted: null },
          significantStrikes: { landed: 14, percent: null, attempted: null },
          knockdowns: { landed: 0, percent: null, attempted: null }
        },
        // ... more rounds
      ]
    },
    significantStrikesByTarget: {
      fullFight: {
        head: { landed: 43, percent: 0.49 },
        body: { landed: 26, percent: 0.3 },
        leg: { landed: 18, percent: 0.21 }
      },
      rounds: [
        {
          round: 1,
          head: { landed: 8, percent: 0.57 },
          body: { landed: 4, percent: 0.29 },
          leg: { landed: 2, percent: 0.14 }
        },
        // ... more rounds
      ]
    },
    significantStrikesByPosition: {
      fullFight: {
        distance: { landed: 87, percent: 0.29, attempted: null },
        clinch: { landed: 0, percent: null, attempted: null },
        ground: { landed: 0, percent: null, attempted: null }
      },
      rounds: [
        {
          round: 1,
          distance: { landed: 14, percent: 0.21, attempted: null },
          clinch: { landed: 0, percent: null, attempted: null },
          ground: { landed: 0, percent: null, attempted: null }
        },
        // ... more rounds
      ]
    }
    // ... more detailed fight statistics
  },
  // ... blue corner and other data
}
```

#### getFighter(slug: string): Promise&lt;Fighter&gt;

Retrieves a fighter's profile from https://www.ufc.com/athlete/.

```typescript
// Returns:
{
  info: {
    name: 'Petr Yan',
    nickname: 'No Mercy',
    status: 'Active',
    rank: 'C',
    age: 32,
    height: 67.5,
    weight: 136,
    armReach: 67,
    legReach: 38,
    fightingStyle: 'Boxer',
    division: 'Bantamweight Division',
    placeOfBirth: 'Krasnoyarsk Krai, Russia',
    trainingCamp: 'Team Yan',
    octagonDebut: 'Jun. 23, 2018',
    imageURL: 'https://ufc.com/images/styles/athlete_bio_full_body/s3/2025-07/YAN_PETR_L_07-26.png?itok=B6thBTVc'
  },
  stats: {
    record: { wins: 19, losses: 5, draws: 0 },
    winByMethod: {
      ko: { value: 7, percent: 0.37 },
      decision: { value: 11, percent: 0.58 },
      submission: { value: 1, percent: 0.05 },
      firstRoundFinishes: 3
    },
    strikingAccuracy: {
      significantStrikesLanded: 1317,
      significantStrikesAttempted: 2422,
      significantStrikeLandedPercent: 0.54
    },
    takedownAccuracy: {
      takedownsLanded: 0,
      takedownsAttempted: 56,
      takedownsLandedPercent: 0
    },
    striking: {
      significantStrikesLanded: 5.12,
      significantStrikesAbsorbed: 4.14,
      significantStrikesDefense: 0.59
    },
    grappling: {
      takedownAverage: 1.58,
      takedownDefensePercent: 0.85,
      submissionAverage: 0.12
    },
    metrics: { knockdownAverage: 0.58, averageFightTime: '17:08' },
    significantStrikeByPosition: {
      standing: { value: 967, percent: 0.73 },
      clinch: { value: 158, percent: 0.12 },
      ground: { value: 192, percent: 0.15 }
    },
    significantStrikeByTarget: {
      head: { value: 899, percent: 0.68 },
      body: { value: 259, percent: 0.2 },
      leg: { value: 159, percent: 0.12 }
    }
  }
}
```

#### getFighterRecord(slug: string, pageNumber?: number): Promise&lt;FighterRecordList&gt;

Retrieves the past 3 fights of a fighter's history from https://www.ufc.com/athlete/, ordered from latest to oldest.

```typescript
// Returns:
[
  {
    fightId: 12182,
    event: { name: 'UFC 317', slug: 'ufc-317', date: '2025-06-28' },
    red: { name: '', slug: 'brandon-royval', result: 'loss' },
    blue: { name: 'Joshua Van', slug: 'joshua-van', result: 'win' },
    result: { method: 'Decision - Unanimous', round: 3, time: '5:00' },
  },
  // ... more fights
]
```

#### getFighters(pageNumber?: number): Promise&lt;FighterSummaryList&gt;

Retrieves 12 fighters from https://www.ufc.com/athletes/all?page=, ordered alphabetically.

```typescript
// Returns:
[
  {
    nickname: 'The Assassin',
    name: 'Danny Abbadi',
    division: 'Lightweight',
    record: { wins: 2, losses: 2, draws: 0 },
    slug: 'danny-abbadi',
  },
  {
    nickname: null,
    name: 'Nariman Abbassov',
    division: 'Lightweight',
    record: { wins: 0, losses: 1, draws: 0 },
    slug: 'nariman-abbassov',
  },
  {
    nickname: 'Tank',
    name: 'Tank Abbott',
    division: 'Heavyweight',
    record: { wins: 8, losses: 10, draws: 0 },
    slug: 'tank-abbott',
  },
  // ... more fighters
]
```

#### getRankings(): Promise&lt;Rankings&gt;

Retrieves current rankings across all weight divisions from https://www.ufc.com/rankings.

```typescript
// Returns:
{
  mensPoundForPound: [
    { rank: 1, name: 'Islam Makhachev', slug: 'islam-makhachev' },
    { rank: 2, name: 'Ilia Topuria', slug: 'ilia-topuria' },
    { rank: 3, name: 'Merab Dvalishvili', slug: 'merab-dvalishvili' },
    { rank: 4, name: 'Khamzat Chimaev', slug: 'khamzat-chimaev' },
    { rank: 5, name: 'Alexandre Pantoja', slug: 'alexandre-pantoja' },
    // ... more rankings
  ],
  flyweight: [
    { rank: 1, name: 'Joshua Van', slug: 'joshua-van' },
    { rank: 2, name: 'Brandon Moreno', slug: 'brandon-moreno' },
    { rank: 3, name: 'Brandon Royval', slug: 'brandon-royval' },
    // ... more rankings
  ],
  // ... all divisions
}
```

#### getTitleholders(): Promise&lt;Titleholders&gt;

Retrieves current UFC titleholders for each division from https://www.ufc.com/athletes.

```typescript
// Returns:
{
  flyweight: {
    name: 'Alexandre Pantoja',
    nickname: 'The Cannibal',
    slug: 'alexandre-pantoja',
    record: { wins: 30, losses: 5, draws: 0 },
    lastFight: 'Alexandre Pantoja vs Kai Kara-France'
  },
  bantamweight: {
    name: 'Merab Dvalishvili',
    nickname: 'The Machine',
    slug: 'merab-dvalishvili',
    record: { wins: 21, losses: 4, draws: 0 },
    lastFight: 'Merab Dvalishvili vs Cory Sandhagen'
  },
  // ... all divisions
}
```


## Author

Guillermo Guevara

## Credit

This project is a fork of [UFC-Scraper](https://github.com/Vladimir-G4/UFC-Scraper) by Vladimir-G4.

## License

MIT

## Contributing

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases. Version numbers are automatically determined based on commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

When contributing to this project, please follow this format for your commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify `src` or `test` files
- `revert`: Reverts a previous commit

#### Examples:
```
feat(scraper): add support for fighter statistics
fix(parser): handle missing event dates
docs: update API documentation
```
