export interface FightRecord {
  wins: number
  losses: number
  draws: number
}

export interface FighterProfile {
  nickname: string | null
  name: string
  weight: string
  record: FightRecord
  slug: string
}
