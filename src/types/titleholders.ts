import type { FightRecord } from "./common.js";

export type Titleholder = {
  name: string;
  nickname: string;
  slug: string;
  record: FightRecord;
  lastFight: string;
};

export type Titleholders = Record<string, Titleholder>;
