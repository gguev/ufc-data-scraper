import { FightResult } from './common.js'

export interface FighterEvent {
  name: string
  slug: string
  date: string
}

export interface FighterBasicProfile {
  name: string
  slug: string
  result: 'win' | 'loss' | 'draw'
}

export interface FighterRecord {
  fightId: number
  event: FighterEvent
  red: FighterBasicProfile
  blue: FighterBasicProfile
  result: FightResult
}

export type FighterRecordList = FighterRecord[]
