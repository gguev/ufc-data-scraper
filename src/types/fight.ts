export type FightStatBlock = {
  landed: number;
  attempted?: number | null;
  percent?: number | null;
};

export type FightPositionStats = {
  distance: FightStatBlock;
  clinch: FightStatBlock;
  ground: FightStatBlock;
};

export type FightTargetStats = {
  head: FightStatBlock;
  body: FightStatBlock;
  leg: FightStatBlock;
};

export type FightOverview = {
  totalStrikes: FightStatBlock;
  takedowns: FightStatBlock;
  submissionAttempts: FightStatBlock;
  reversals: FightStatBlock;
  significantStrikes: FightStatBlock;
  knockdowns: FightStatBlock;
};

export type FightRoundStats<T> = {
  fullFight: T;
  rounds: Array<{ round: number } & T>;
};

export type FightSideStats = {
  fightOverview: FightRoundStats<FightOverview>;
  significantStrikesByTarget: FightRoundStats<FightTargetStats>;
  significantStrikesByPosition: FightRoundStats<FightPositionStats>;
};

export type FightStats = {
  red: FightSideStats;
  blue: FightSideStats;
};
