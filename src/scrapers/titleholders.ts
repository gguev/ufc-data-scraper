import * as cheerio from 'cheerio'
import { fetchHtml } from '../utils/fetch.js'
import { parseRecord } from './fighter.js'
import { ScrapingError } from '../errors/index.js'

export async function getTitleholders() {
  try {
    const url = 'https://www.ufc.com/athletes'
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    let titleholdersDict: Record<string, any> = {}

    $('.l-listing__item').each((i, element) => {
      const division = $(element).find('.ath-wlcass strong').text().trim()
      const weight = $(element).find('.ath-weight').text().trim()
      // const champName = $(element).find('.ath-n__name a span').text().trim();

      const champAnchor = $(element).find('.ath-n__name a')
      const champName = champAnchor.text().trim()
      const champUrl = new URL(champAnchor.attr('href'), 'https://www.ufc.com').href

      const champNickname = $(element).find('.ath-nn__nickname .field__item').text().trim().replace(/^"|"$/g, '')
      const champRecord = parseRecord($(element).find('.c-ath--record').text().trim())
      const champLastFight = $(element).find('.view-fighter-last-fight .view-content .views-row').first().text().trim()

      if (division) {
        titleholdersDict[division.toLowerCase()] = {
          name: champName,
          nickname: champNickname,
          slug: champUrl.split('/').filter(Boolean).pop() || '',
          record: champRecord,
          lastFight: champLastFight
        }
      }
    })

    if (Object.keys(titleholdersDict).length === 0) {
      throw new ScrapingError('No titleholders found on page', { url })
    }

    return titleholdersDict
  } catch (error) {
    if (error instanceof ScrapingError) {
      throw error
    }
    
    throw new ScrapingError(`Failed to fetch titleholders: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      url: 'https://www.ufc.com/athletes',
      originalError: error instanceof Error ? error.stack : String(error) 
    })
  }
}
