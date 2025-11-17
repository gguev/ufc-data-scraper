# FightPuppet

<img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/UFC_Logo.png" width="250"/>

A UFC scraper built with Puppeteer that extracts fighter information, statistics, records, rankings, and fight data from UFC.com.

## Installation

```bash
npm install fightpuppet
```

## Features

- 🥊 Scrape detailed fighter profiles and statistics
- 📊 Get current UFC rankings across all weight divisions
- 🏆 Retrieve current titleholders for each division
- 📅 Access event information and fight cards
- 🥇 Extract individual fight details
- 🎯 Built with Puppeteer for reliable scraping
- 📝 Full TypeScript support with included type definitions

## Usage

All functions return promises with typed data. Here are the main functions available:

### Get Fighter Data

Retrieve comprehensive fighter information and statistics:

```typescript
import { getFighter } from 'fightpuppet'

// Get fighter by slug (URL-friendly name)
const fighter = await getFighter('alexander-volkanovski')
if (fighter) {
  console.log(fighter.info.name) // "Alexander Volkanovski"
  console.log(fighter.stats.record) // { wins: 26, losses: 2, draws: 0 }
}
```

### Get Fighter List

Get a paginated list of fighters with basic information:

```typescript
import { getFighters } from 'fightpuppet'

const fighters = await getFighters(0) // Page 0 (first page)
if (fighters) {
  fighters.forEach((fighter) => {
    console.log(
      `${fighter.name} - ${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}`
    )
  })
}
```

### Get Event Fights

Retrieve the fight card for a specific event:

```typescript
import { getEvent } from 'fightpuppet'

const event = await getEvent('ufc-284-makhachev-vs-volkanovski')
if (event) {
  event.forEach((fight) => {
    console.log(`${fight.red.name} vs ${fight.blue.name} - ${fight.boutType}`)
  })
}
```

### Get Events List

Get upcoming or past UFC events:

```typescript
import { getUpcomingEvents, getPastEvents } from 'fightpuppet'

const upcomingEvents = await getUpcomingEvents()
const pastEvents = await getPastEvents(0) // Page 0
```

### Get Rankings

Retrieve current UFC rankings for all divisions:

```typescript
import { getRankings } from 'fightpuppet'

const rankings = await getRankings()
if (rankings) {
  const lightweightRankings = rankings.lightweight
  console.log(lightweightRankings) // RankedFighter[] with rank, name, and url
}
```

### Get Titleholders

Retrieve current champions across all divisions:

```typescript
import { getTitleholders } from 'fightpuppet'

const titleholders = await getTitleholders()
if (titleholders) {
  const lightweightChamp = titleholders.lightweight
  console.log(lightweightChamp.name)
  console.log(lightweightChamp.record)
}
```

### Get Individual Fight Details

Extract detailed statistics from a specific fight:

```typescript
import { getFight } from 'fightpuppet'

const fight = await getFight('ufc-284-makhachev-vs-volkanovski', 12345)
if (fight) {
  console.log(fight)
}
```

## TypeScript Types

FightPuppet includes full TypeScript definitions. Here are the main type interfaces:

```typescript
// Fighter data
interface Fighter {
  info: FighterInfo
  stats: FighterStats
}

// Event data
interface Event {
  eventName: string
  headline: string
  mainCard: StartTime
  prelim: StartTime
  slug: string
  location: Location
}

// Fight card
interface Fight {
  boutType: string
  red: Corner
  blue: Corner
  result: FightResult | null
  awards: string[] | null
}

// Rankings
interface RankedFighter {
  rank: number
  name: string
  url: string
}

type Rankings = Record<string, DivisionRanking>
```

## API Reference

### Functions

- `getFighter(slug: string): Promise<Fighter | null>` - Get detailed fighter data
- `getFighters(pageNumber: number): Promise<FighterSummary[] | null>` - Get paginated fighter list
- `getEvent(slug: string): Promise<FightCard | null>` - Get event fight card
- `getUpcomingEvents(): Promise<Event[] | null>` - Get upcoming events
- `getPastEvents(pageNumber: number): Promise<Event[] | null>` - Get past events
- `getRankings(): Promise<Rankings | null>` - Get current rankings
- `getTitleholders(): Promise<Titleholders | null>` - Get current champions
- `getFight(slug: string, fightId: number): Promise<any | null>` - Get fight details

## Error Handling

All functions return `null` when an error occurs. Always check for null values:

```typescript
const fighter = await getFighter('some-fighter')
if (!fighter) {
  console.error('Failed to retrieve fighter data')
  return
}
// Safe to use fighter object
```

## How Fighter Slugs Work

Fighter slugs are URL-friendly versions of fighter names used by UFC.com:

- Spaces become hyphens
- Names are lowercase
- Special characters may be removed or modified

Examples:

- "Alexander Volkanovski" → "alexander-volkanovski"
- "Max Holloway" → "max-holloway"
- "Jamahal Hill" → "jamahal-hill"

## Requirements

- Node.js >= 18.0.0
- Works with both CommonJS and ES modules

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
