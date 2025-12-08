import type { FightRecord } from "./common.js";

export type Rank = "C" | number | null;

type ValuePct = {
  value: number;
  percent: number;
};

export type FighterInfo = {
  name: string;
  nickname: string;
  status: "Active" | "Retired" | "Not Fighting";
  rank: Rank;
  age: number;
  height: number;
  weight: number;
  armReach: number;
  legReach: number;
  fightingStyle: string;
  division: string;
  placeOfBirth: string;
  trainingCamp: string;
  octagonDebut: string;
  imageURL: string;
};

export type FighterStats = {
  record: FightRecord;
  winByMethod: {
    ko: ValuePct;
    decision: ValuePct;
    submission: ValuePct;
    firstRoundFinishes: number;
  };
  strikingAccuracy: {
    significantStrikesLanded: number;
    significantStrikesAttempted: number;
    significantStrikeLandedPercent: number;
  };
  takedownAccuracy: {
    takedownsLanded: number;
    takedownsAttempted: number;
    takedownsLandedPercent: number;
  };
  striking: {
    significantStrikesLanded: number;
    significantStrikesAbsorbed: number;
    significantStrikesDefense: number;
  };
  grappling: {
    takedownAverage: number;
    takedownDefensePercent: number;
    submissionAverage: number;
  };
  metrics: {
    knockdownAverage: number;
    averageFightTime: string;
  };
  significantStrikeByPosition: {
    standing: ValuePct;
    clinch: ValuePct;
    ground: ValuePct;
  };
  significantStrikeByTarget: {
    head: ValuePct;
    body: ValuePct;
    leg: ValuePct;
  };
};

export type Fighter = {
  info: FighterInfo;
  stats: FighterStats;
};
