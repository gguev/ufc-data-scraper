import * as cheerio from 'cheerio'
import { DECIMAL_RADIX } from '../constants/index.js'
import { DivisionRanking, RankedFighter, Rankings } from '../types/rankings.js'
import { fetchHtml } from '../utils/fetch.js'
import { ScrapingError } from '../errors/index.js'

// Map of exact header texts to normalized keys
const divisionNameMap: Record<string, string> = {
  "men's pound-for-pound top rank": 'mensPoundForPound',
  "women's pound-for-pound top rank": 'womensPoundForPound',
  "men's flyweight": 'flyweight',
  "men's bantamweight": 'bantamweight',
  "men's featherweight": 'featherweight',
  "men's lightweight": 'lightweight',
  "men's welterweight": 'welterweight',
  "men's middleweight": 'middleweight',
  "men's light heavyweight": 'lightHeavyweight',
  "men's heavyweight": 'heavyweight',
  "women's strawweight": 'womensStrawweight',
  "women's flyweight": 'womensFlyweight',
  "women's bantamweight": 'womensBantamweight',
  "women's featherweight": 'womensFeatherweight'
}

function normalizeDivisionName(headerRaw: string): string {
  // First try exact match in our map
  const normalized = divisionNameMap[headerRaw.toLowerCase().trim()]
  if (normalized) {
    return normalized
  }

  // Fallback to basic camelCase conversion for any unknown divisions
  return headerRaw
    .trim()
    .split(' ')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('')
}

export async function getRankings(): Promise<Rankings> {
  try {
    const url = 'https://www.ufc.com/rankings'
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const rankings: Rankings = {}
    $('.view-grouping').each((i, element) => {
      const headerRaw = $(element).find('.view-grouping-header').text().trim()
      const weightClass = normalizeDivisionName(headerRaw)

      const fighters: DivisionRanking = {}

      $(element)
        .find('tbody tr')
        .each((_, row) => {
          const rankText = $(row).find('.views-field-weight-class-rank').text().trim()
          const rank = parseInt(rankText, DECIMAL_RADIX)

          const fighterAnchor = $(row).find('.views-field-title a')
          const fighterName = fighterAnchor.text().trim()
          const fighterUrl = new URL(fighterAnchor.attr('href'), 'https://www.ufc.com').href
          const fighterSlug = fighterUrl.split('/').filter(Boolean).pop() || ''

          if (!isNaN(rank)) {
            fighters[rank.toString()] = {
              rank,
              name: fighterName,
              slug: fighterSlug
            }
          }
        })

      rankings[weightClass] = fighters
    })

    if (Object.keys(rankings).length === 0) {
      throw new ScrapingError('No ranking data found on the page', { url })
    }

    return rankings
  } catch (error) {
    if (error instanceof ScrapingError) {
      throw error
    }
    
    throw new ScrapingError(`Failed to fetch rankings: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      url: 'https://www.ufc.com/rankings',
      originalError: error instanceof Error ? error.stack : String(error) 
    })
  }
}
