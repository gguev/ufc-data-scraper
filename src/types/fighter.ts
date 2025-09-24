export type UrlString = string
export type RecordString = string
export type PercentString = string
export type TimeString = string

export interface WinByMethod {
  KO: string
  Decision: string
  Submission: string
}

export interface SigStrikeByPosition {
  Standing: string
  Clinch: string
  Ground: string
}

export interface SigStrikeByTarget {
  Head: string
  Body: string
  Leg: string
}

export interface StrikingAccuracy {
  SigStrikesLanded: string
  SigStrikesAttempted: string
}

export interface TakedownAccuracy {
  TakedownsLanded: string
  TakedownsAttempted: string
}

export interface FighterStats {
  Record: RecordString
  WinByMethod: WinByMethod
  AvgFightTime: TimeString
  SigStrikeByPosition: SigStrikeByPosition
  SigStrikeByTarget: SigStrikeByTarget
  StrikingAccuracy: StrikingAccuracy
  TakedownAccuracy: TakedownAccuracy
}

export interface FighterInfo {
  Name: string
  Nickname: string
  Status: 'Active' | 'Retired' | 'Suspended'
  Age: string
  Height: string // inches
  Weight: string // pounds
  ArmReach: string
  LegReach: string
  FightingStyle: string
  Division: string
  PlaceOfBirth: string
  TrainingCamp: string
  OctagonDebut: string
  ImageURL: UrlString
}

export interface Fighter {
  url: UrlString
  FighterInfo: FighterInfo
  FighterStats: FighterStats
}
