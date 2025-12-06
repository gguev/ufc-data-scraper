import type { FightResult } from "./common.js";

export type FighterEvent = {
  name: string;
  slug: string;
  date: string;
};

export type FighterBasicProfile = {
  name: string;
  slug: string;
  result: "win" | "loss" | "draw";
};

export type FighterRecord = {
  fightId: number;
  event: FighterEvent;
  red: FighterBasicProfile;
  blue: FighterBasicProfile;
  result: FightResult;
};

export type FighterRecordList = FighterRecord[];
