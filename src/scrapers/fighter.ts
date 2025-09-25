import * as cheerio from 'cheerio'
import { Fighter } from '../types/fighter'
import { fetchHtml } from '../utils/fetch'

export async function getFighter(fighterURL: string): Promise<Fighter | null> {
  try {
    const url = fighterURL

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const fighterData: Fighter = {
      url,
      FighterInfo: parseFighterInfo($),
      FighterStats: parseFighterStats($),
    }

    return fighterData
  } catch (error) {
    console.error(`[FATAL] Error scraping fighter data:`, error)
    return null
  }
}

function parseFighterInfo($) {
  try {
    const getBioText = (selector) =>
      $(`.c-bio__label:contains("${selector}")`)
        .next('.c-bio__text')
        .text()
        .trim()

    return {
      Name: $('.hero-profile__name').text().trim(),
      Nickname: $('.hero-profile__nickname')
        .text()
        .trim()
        .replace(/^"|"$/g, ''),
      Status: getBioText('Status'),
      Age: parseNumber(getBioText('Age')),
      Height: parseNumber(getBioText('Height')),
      Weight: parseNumber(getBioText('Weight')),
      ArmReach: parseNumber(getBioText('Reach')),
      LegReach: parseNumber(getBioText('Leg reach')),
      FightingStyle: getBioText('Fighting style'),
      Division: $('.hero-profile__division-title').text().trim(),
      PlaceOfBirth: getBioText('Place of Birth'),
      TrainingCamp: getBioText('Trains at'),
      OctagonDebut: getBioText('Octagon Debut'),
      ImageURL: $('.hero-profile__image').attr('src') || '',
    }
  } catch (error) {
    console.error(`[PARSER] Error parsing fighter info:`, error)
    return null
  }
}

function parseFighterStats($) {
  try {
    const getStatValue = (selector) =>
      $(`.c-stat-3bar__label:contains("${selector}")`)
        .next('.c-stat-3bar__value')
        .first()
        .text()
        .trim()

    return {
      Record: parseRecord($('.hero-profile__division-body').text().trim()),
      WinByMethod: {
        KO: parseValuePercent(getStatValue('KO/TKO')),
        Decision: parseValuePercent(getStatValue('DEC')),
        Submission: parseValuePercent(getStatValue('SUB')),
      },
      AvgFightTime: $('.c-stat-compare__label:contains("Average fight time")')
        .prev('.c-stat-compare__number')
        .first()
        .text()
        .trim(),
      SigStrikeByPosition: {
        Standing: parseValuePercent(getStatValue('Standing')),
        Clinch: parseValuePercent(getStatValue('Clinch')),
        Ground: parseValuePercent(getStatValue('Ground')),
      },
      SigStrikeByTarget: {
        Head: {
          value: parseNumber($('#e-stat-body_x5F__x5F_head_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_head_percent').text()),
        },
        Body: {
          value: parseNumber($('#e-stat-body_x5F__x5F_body_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_body_percent').text()),
        },
        Leg: {
          value: parseNumber($('#e-stat-body_x5F__x5F_leg_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_leg_percent').text()),
        },
      },
      StrikingAccuracy: {
        SigStrikesLanded: parseNumber(
          $('.c-overlap__stats-text:contains("Sig. Strikes Landed")')
            .next('.c-overlap__stats-value')
            .first()
            .text()
            .trim()
        ),
        SigStrikesAttempted: parseNumber(
          $('.c-overlap__stats-text:contains("Sig. Strikes Attempted")')
            .next('.c-overlap__stats-value')
            .first()
            .text()
            .trim()
        ),
      },
      TakedownAccuracy: {
        TakedownsLanded: parseNumber(
          $('.c-overlap__stats-text:contains("Takedowns Landed")')
            .next('.c-overlap__stats-value')
            .first()
            .text()
            .trim()
        ),
        TakedownsAttempted: parseNumber(
          $('.c-overlap__stats-text:contains("Takedowns Attempted")')
            .next('.c-overlap__stats-value')
            .first()
            .text()
            .trim()
        ),
      },
    }
  } catch (error) {
    console.error(`[PARSER] Error parsing fighter stats:`, error)
    return null
  }
}

export function parseRecord(txt: string): {
  Wins: number
  Losses: number
  Draws: number
} {
  const record = txt.match(/(\d+)-(\d+)-(\d+)/)
  return {
    Wins: +record[1],
    Losses: +record[2],
    Draws: +record[3],
  }
}

function parseValuePercent(txt: string): { value: number; percent: number } {
  const [v, p] = txt.trim().split(' ')

  return {
    value: Number(v),
    percent: Number(p.replace(/[%()]/g, '')) / 100,
  }
}

function parseNumber(txt: string): number {
  return Number(txt.trim()) || 0
}

function parsePercent(txt: string): number {
  return Number(txt.replace(/[^\d.]/g, '')) / 100
}
