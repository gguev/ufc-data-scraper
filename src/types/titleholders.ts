export interface Titleholder {
  name: string
  nickname: string
  slug: string
  record: {
    wins: number
    losses: number
    draws: number
  }
  lastFight: string
}

export type Titleholders = Record<string, Titleholder>
