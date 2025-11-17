import { FightRecord } from './common.js'

export interface FighterSummary {
  nickname: string | null
  name: string
  weight: string
  record: FightRecord
  slug: string
}
