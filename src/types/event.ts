import { FightResult } from './common.js'

export interface Corner {
  name: string
  rank: 'C' | number | null
  odds: string | null
  country: string | null
  outcome: 'no contest' | 'draw' | 'win' | 'loss' | null
  slug: string | null
}

export interface Fight {
  boutType: string
  red: Corner
  blue: Corner
  result: FightResult | null
  awards: string[] | null
}

export type FightCard = Fight[]
