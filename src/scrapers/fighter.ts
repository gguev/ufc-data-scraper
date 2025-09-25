import * as cheerio from 'cheerio'
import { fetchHtml } from '../utils/fetch'

export async function getFighter(fighterURL) {
  try {
    const url = fighterURL

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const fighterData = {
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

export async function getFighterInfo(fighterName) {
  const data = await getFighter(fighterName)
  return data?.FighterInfo || null
}

export async function getFighterStats(fighterName) {
  const data = await getFighter(fighterName)
  return data?.FighterStats || null
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
      Age: getBioText('Age'),
      Height: getBioText('Height'),
      Weight: getBioText('Weight'),
      ArmReach: getBioText('Reach'),
      LegReach: getBioText('Leg reach'),
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
      Record: $('.hero-profile__division-body').text().trim(),
      WinByMethod: {
        KO: getStatValue('KO/TKO'),
        Decision: getStatValue('DEC'),
        Submission: getStatValue('SUB'),
      },
      AvgFightTime: $('.c-stat-compare__label:contains("Average fight time")')
        .prev('.c-stat-compare__number')
        .first()
        .text()
        .trim(),
      SigStrikeByPosition: {
        Standing: getStatValue('Standing'),
        Clinch: getStatValue('Clinch'),
        Ground: getStatValue('Ground'),
      },
      SigStrikeByTarget: {
        Head: $('#e-stat-body_x5F__x5F_head_value').text().trim(),
        Body: $('#e-stat-body_x5F__x5F_body_value').text().trim(),
        Leg: $('#e-stat-body_x5F__x5F_leg_value').text().trim(),
      },
      StrikingAccuracy: {
        SigStrikesLanded: $(
          '.c-overlap__stats-text:contains("Sig. Strikes Landed")'
        )
          .next('.c-overlap__stats-value')
          .first()
          .text()
          .trim(),
        SigStrikesAttempted: $(
          '.c-overlap__stats-text:contains("Sig. Strikes Attempted")'
        )
          .next('.c-overlap__stats-value')
          .first()
          .text()
          .trim(),
      },
      TakedownAccuracy: {
        TakedownsLanded: $(
          '.c-overlap__stats-text:contains("Takedowns Landed")'
        )
          .next('.c-overlap__stats-value')
          .first()
          .text()
          .trim(),
        TakedownsAttempted: $(
          '.c-overlap__stats-text:contains("Takedowns Attempted")'
        )
          .next('.c-overlap__stats-value')
          .first()
          .text()
          .trim(),
      },
    }
  } catch (error) {
    console.error(`[PARSER] Error parsing fighter stats:`, error)
    return null
  }
}
