import * as cheerio from 'cheerio'
import { fetchHtml } from '../utils/fetch.js'

export async function getRankings() {
  try {
    const url = 'https://www.ufc.com/rankings'
    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const rankingsDict = {}
    $('.view-grouping').each((i, element) => {
      const header = $(element).find('.view-grouping-header').text().trim()
      const rankings = {}

      $(element)
        .find('tbody tr')
        .each((j, row) => {
          const rankText = $(row)
            .find('.views-field-weight-class-rank')
            .text()
            .trim()
          const rank = parseInt(rankText, 10)

          const fighterAnchor = $(row).find('.views-field-title a')
          const fighterName = fighterAnchor.text().trim()
          const fighterUrl = new URL(
            fighterAnchor.attr('href'),
            'https://www.ufc.com'
          ).href

          if (!isNaN(rank)) {
            rankings[rank] = {
              name: fighterName,
              url: fighterUrl,
            }
          }
        })

      rankingsDict[header] = rankings
    })

    return rankingsDict
  } catch (error) {
    console.error(`[FATAL] Error scraping rankings:`, error)
    return null
  }
}
