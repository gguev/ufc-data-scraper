export interface WinByMethod {
  KO: {
    value: number
    percent: number
  }
  Decision: {
    value: number
    percent: number
  }
  Submission: {
    value: number
    percent: number
  }
}

export interface SigStrikeByPosition {
  Standing: {
    value: number
    percent: number
  }
  Clinch: {
    value: number
    percent: number
  }
  Ground: {
    value: number
    percent: number
  }
}

export interface SigStrikeByTarget {
  Head: number
  Body: number
  Leg: number
}

export interface StrikingAccuracy {
  SigStrikesLanded: number
  SigStrikesAttempted: number
}

export interface TakedownAccuracy {
  TakedownsLanded: number
  TakedownsAttempted: number
}

export interface FighterStats {
  Record: {
    Wins: number
    Losses: number
    Draws: number
  }
  WinByMethod: WinByMethod
  AvgFightTime: string
  SigStrikeByPosition: SigStrikeByPosition
  SigStrikeByTarget: SigStrikeByTarget
  StrikingAccuracy: StrikingAccuracy
  TakedownAccuracy: TakedownAccuracy
}

export interface FighterInfo {
  Name: string
  Nickname: string
  Status: 'Active' | 'Retired' | 'Suspended'
  Age: number
  Height: number // inches
  Weight: number // pounds
  ArmReach: number
  LegReach: number
  FightingStyle: string
  Division: string
  PlaceOfBirth: string
  TrainingCamp: string
  OctagonDebut: string
  ImageURL: string
}

export interface Fighter {
  url: string
  FighterInfo: FighterInfo
  FighterStats: FighterStats
}
