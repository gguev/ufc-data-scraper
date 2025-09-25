export interface Titleholder {
  Weight: string
  ChampName: string
  ChampUrl: string
  ChampNickname: string
  ChampRecord: string
  ChampLastFight: string
}

export type Titleholders = Record<string, Titleholder>
