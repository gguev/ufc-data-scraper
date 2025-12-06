import type { FightRecord } from "./common.js";

export type FighterSummary = {
  name: string;
  nickname: string | null;
  division: string;
  record: FightRecord;
  slug: string;
};

export type FighterSummaryList = FighterSummary[];
