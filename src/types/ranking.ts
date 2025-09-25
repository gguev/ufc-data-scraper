export interface RankedFighter {
  name: string
  url: string
}
export type DivisionRanking = Record<string, RankedFighter>
export type Rankings = Record<string, DivisionRanking>
