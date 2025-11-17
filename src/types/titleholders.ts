import { FightRecord } from './common.js'

export interface Titleholder {
  name: string
  nickname: string
  slug: string
  record: FightRecord
  lastFight: string
}

export type Titleholders = Record<string, Titleholder>
