export interface Titleholder {
  Weight: string
  ChampName: string
  ChampUrl: string
  ChampNickname: string
  ChampRecord: {
    Wins: number
    Losses: number
    Draws: number
  }
  ChampLastFight: string
}

export type Titleholders = Record<string, Titleholder>
