import type { FightResult } from "./common.js";

export type Corner = {
  name: string;
  rank: "C" | number | null;
  odds: string | null;
  country: string | null;
  outcome: "no contest" | "draw" | "win" | "loss" | null;
  slug: string | null;
};

export type Fight = {
  fightId: number;
  boutType: string;
  red: Corner;
  blue: Corner;
  result: FightResult | null;
  awards: string[] | null;
};

export type FightCard = Fight[];
