export interface FightStatBlock {
  landed: number
  attempted?: number | null
  percent?: number | null
}

export interface FightPositionStats {
  distance: FightStatBlock
  clinch: FightStatBlock
  ground: FightStatBlock
}

export interface FightTargetStats {
  head: FightStatBlock
  body: FightStatBlock
  leg: FightStatBlock
}

export interface FightOverview {
  totalStrikes: FightStatBlock
  takedowns: FightStatBlock
  submissionAttempts: FightStatBlock
  reversals: FightStatBlock
  significantStrikes: FightStatBlock
  knockdowns: FightStatBlock
}

export interface FightRoundStats<T> {
  fullFight: T
  rounds: Array<{ round: number } & T>
}

export interface FightSideStats {
  fightOverview: FightRoundStats<FightOverview>
  significantStrikesByTarget: FightRoundStats<FightTargetStats>
  significantStrikesByPosition: FightRoundStats<FightPositionStats>
}

export interface FightStats {
  red: FightSideStats
  blue: FightSideStats
}
