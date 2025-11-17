// Common types shared across the UFC scraper

export interface FightRecord {
  wins: number
  losses: number
  draws: number
}

export interface FighterInfo {
  name: string
  slug: string
  record?: FightRecord
  nickname?: string | null
}

export interface FightResult {
  method: string
  round: number
  time: string
}
