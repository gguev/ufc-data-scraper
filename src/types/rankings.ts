export interface RankedFighter {
  rank: number
  name: string
  url: string
}
export type DivisionRanking = Record<string, RankedFighter>
export type Rankings = Record<string, DivisionRanking>
