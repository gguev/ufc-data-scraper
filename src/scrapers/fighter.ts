import * as cheerio from 'cheerio'
import { PERCENT_MULTIPLIER, TO_FIXED_DECIMALS } from '../constants/index.js'
import { ScrapingError, ValidationError } from '../errors/index.js'
import { Fighter } from '../types/fighter.js'
import { fetchHtml } from '../utils/fetch.js'
import { validateSlug } from '../utils/validation.js'

export async function getFighter(slug: string): Promise<Fighter> {
  const validatedSlug = validateSlug(slug, 'slug')

  try {
    const url = `https://www.ufc.com/athlete/${validatedSlug}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const info = parseFighterInfo($)
    const stats = parseFighterStats($)

    if (!info) {
      throw new ScrapingError('Failed to parse fighter info from page', { url })
    }

    if (!stats) {
      throw new ScrapingError('Failed to parse fighter stats from page', { url })
    }

    const fighterData: Fighter = {
      info,
      stats
    }

    return fighterData
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error
    }

    throw new ScrapingError(
      `Failed to fetch fighter data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        slug: validatedSlug,
        originalError: error instanceof Error ? error.stack : String(error)
      }
    )
  }
}

function parseFighterInfo($) {
  try {
    const getBioText = (selector) => $(`.c-bio__label:contains("${selector}")`).next('.c-bio__text').text().trim()

    return {
      name: $('.hero-profile__name').text().trim(),
      nickname: $('.hero-profile__nickname').text().trim().replace(/^"|"$/g, ''),
      status: getBioText('Status'),
      age: parseNumber(getBioText('Age')),
      height: parseNumber(getBioText('Height')),
      weight: parseNumber(getBioText('Weight')),
      armReach: parseNumber(getBioText('Reach')),
      legReach: parseNumber(getBioText('Leg reach')),
      fightingStyle: getBioText('Fighting style'),
      division: $('.hero-profile__division-title').text().trim(),
      placeOfBirth: getBioText('Place of Birth'),
      trainingCamp: getBioText('Trains at'),
      octagonDebut: getBioText('Octagon Debut'),
      imageURL: $('.hero-profile__image').attr('src') || ''
    }
  } catch (error) {
    console.error(`[PARSER] Error parsing fighter info:`, error)
    return null
  }
}

function parseFighterStats($) {
  try {
    const getStatValue = (selector) =>
      $(`.c-stat-3bar__label:contains("${selector}")`).next('.c-stat-3bar__value').first().text().trim()

    const record = parseRecord($('.hero-profile__division-body').text().trim())

    const ko = parseValuePercent(getStatValue('KO/TKO'))

    const decision = parseValuePercent(getStatValue('DEC'))

    const submission = parseValuePercent(getStatValue('SUB'))

    const firstRoundFinishes =
      Number(
        $('.athlete-stats__stat')
          .filter((_, el) => $(el).find('.athlete-stats__stat-text').text().includes('First Round Finishes'))
          .find('.athlete-stats__stat-numb')
          .first()
          .text()
          .trim()
      ) || 0

    const sigStrikesLanded = parseNumber(
      $('.c-overlap__stats-text:contains("Sig. Strikes Landed")').next('.c-overlap__stats-value').first().text().trim()
    )

    const sigStrikesAttempted = parseNumber(
      $('.c-overlap__stats-text:contains("Sig. Strikes Attempted")')
        .next('.c-overlap__stats-value')
        .first()
        .text()
        .trim()
    )

    const sigStrikeLandedPercent = parseFloat((sigStrikesLanded / sigStrikesAttempted).toFixed(TO_FIXED_DECIMALS))

    const takedownsLanded = parseNumber(
      $('.c-overlap__stats-text:contains("Takedowns Landed")').next('.c-overlap__stats-value').first().text().trim()
    )

    const takedownsAttempted = parseNumber(
      $('.c-overlap__stats-text:contains("Takedowns Attempted")').next('.c-overlap__stats-value').first().text().trim()
    )

    const takedownsLandedPercent = parseFloat((takedownsLanded / takedownsAttempted).toFixed(TO_FIXED_DECIMALS))

    const sigStrLanded = Number(
      $('.c-stat-compare__label:contains("Sig. Str. Landed")').prev('.c-stat-compare__number').first().text().trim()
    )
    const sigStrAbsorbed = Number(
      $('.c-stat-compare__label:contains("Sig. Str. Absorbed")').prev('.c-stat-compare__number').first().text().trim()
    )

    const takedownAvg = Number(
      $('.c-stat-compare__label:contains("Takedown avg")').prev('.c-stat-compare__number').first().text().trim()
    )
    const submissionAvg = Number(
      $('.c-stat-compare__label:contains("Submission avg")').prev('.c-stat-compare__number').first().text().trim()
    )
    const sigStrDefense = parsePercent(
      $('.c-stat-compare__label:contains("Sig. Str. Defense")').prev('.c-stat-compare__number').first().text().trim()
    )
    const takedownDefensePercent = parsePercent(
      $('.c-stat-compare__label:contains("Takedown Defense")').prev('.c-stat-compare__number').first().text().trim()
    )
    const knockdownAvg = Number(
      $('.c-stat-compare__label:contains("Knockdown Avg")').prev('.c-stat-compare__number').first().text().trim()
    )
    const avgFightTime = $('.c-stat-compare__label:contains("Average fight time")')
      .prev('.c-stat-compare__number')
      .first()
      .text()
      .trim()

    return {
      record,
      winByMethod: {
        ko,
        decision,
        submission,
        firstRoundFinishes
      },
      strikingAccuracy: {
        significantStrikesLanded: sigStrikesLanded,
        significantStrikesAttempted: sigStrikesAttempted,
        significantStrikeLandedPercent: sigStrikeLandedPercent
      },
      takedownAccuracy: {
        takedownsLanded,
        takedownsAttempted,
        takedownsLandedPercent
      },

      striking: {
        significantStrikesLanded: sigStrLanded,
        significantStrikesAbsorbed: sigStrAbsorbed,
        significantStrikesDefense: sigStrDefense
      },
      grappling: {
        takedownAverage: takedownAvg,
        takedownDefensePercent,
        submissionAverage: submissionAvg
      },
      metrics: {
        knockdownAverage: knockdownAvg,
        averageFightTime: avgFightTime
      },
      significantStrikeByPosition: {
        standing: parseValuePercent(getStatValue('Standing')),
        clinch: parseValuePercent(getStatValue('Clinch')),
        ground: parseValuePercent(getStatValue('Ground'))
      },
      significantStrikeByTarget: {
        head: {
          value: parseNumber($('#e-stat-body_x5F__x5F_head_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_head_percent').text())
        },
        body: {
          value: parseNumber($('#e-stat-body_x5F__x5F_body_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_body_percent').text())
        },
        leg: {
          value: parseNumber($('#e-stat-body_x5F__x5F_leg_value').text()),
          percent: parsePercent($('#e-stat-body_x5F__x5F_leg_percent').text())
        }
      }
    }
  } catch (error) {
    console.error(`[PARSER] Error parsing fighter stats:`, error)
    return null
  }
}

export function parseRecord(txt: string): {
  wins: number
  losses: number
  draws: number
} {
  const record = txt.match(/(\d+)-(\d+)-(\d+)/)
  return {
    wins: +record[1],
    losses: +record[2],
    draws: +record[3]
  }
}

function parseValuePercent(txt: string): { value: number; percent: number } {
  const [v, p] = txt.trim().split(' ')

  return {
    value: Number(v),
    percent: Number(p.replace(/[%()]/g, '')) / PERCENT_MULTIPLIER
  }
}

function parseNumber(txt: string): number {
  return Number(txt.trim()) || 0
}

function parsePercent(txt: string): number {
  return Number(txt.replace(/[^\d.]/g, '')) / PERCENT_MULTIPLIER
}
