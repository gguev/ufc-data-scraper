export type RankedFighter = {
  rank: number;
  name: string;
  slug: string;
};
export type DivisionRanking = RankedFighter[];
export type Rankings = Record<string, DivisionRanking>;
