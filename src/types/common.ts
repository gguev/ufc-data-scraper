// Common types shared across the UFC scraper

export type FightRecord = {
  wins: number;
  losses: number;
  draws: number;
};

export type FighterInfo = {
  name: string;
  slug: string;
  record?: FightRecord;
  nickname?: string | null;
};

export type FightResult = {
  method: string;
  round: number;
  time: string;
};
