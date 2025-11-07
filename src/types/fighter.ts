interface ValuePct {
  value: number
  percent: number
}

export interface FighterInfo {
  name: string
  nickname: string | null
  status: 'Active' | 'Retired'
  age: number
  height: number
  weight: number
  armReach: number
  legReach: number
  fightingStyle: string
  division: string
  placeOfBirth: string
  trainingCamp: string
  octagonDebut: string
  imageURL: string
}

export interface FighterStats {
  record: {
    wins: number
    losses: number
    draws: number
  }
  winByMethod: {
    ko: ValuePct
    decision: ValuePct
    submission: ValuePct
    firstRoundFinishes: number
  }
  strikingAccuracy: {
    sigStrikesLanded: number
    sigStrikesAttempted: number
    sigStrikeLandedPercent: number
  }
  takedownAccuracy: {
    takedownsLanded: number
    takedownsAttempted: number
    takedownsLandedPercent: number
  }
  striking: {
    sigStrLanded: number
    sigStrAbsorbed: number
    sigStrDefense: number
  }
  grappling: {
    takedownAvg: number
    takedownDefensePercent: number
    submissionAvg: number
  }
  metrics: {
    knockdownAvg: number
    avgFightTime: string
  }
  sigStrikeByPosition: {
    standing: ValuePct
    clinch: ValuePct
    ground: ValuePct
  }
  sigStrikeByTarget: {
    head: ValuePct
    body: ValuePct
    leg: ValuePct
  }
}

export interface Fighter {
  info: FighterInfo
  stats: FighterStats
}
