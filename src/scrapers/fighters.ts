import * as cheerio from 'cheerio'
import { FighterSummary } from '../types/fighters.js'
import { fetchHtml } from '../utils/fetch.js'
import { ScrapingError, ValidationError } from '../errors/index.js'
import { validateNumber } from '../utils/validation.js'

export async function getFighters(pageNumber: number = 0): Promise<FighterSummary[]> {
  // Validate input
  const validatedPageNumber = validateNumber(pageNumber, 'pageNumber', 0)
  
  try {
    const url = `https://www.ufc.com/athletes/all?page=${validatedPageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const fighters = parseFighters($)

    return fighters
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error
    }
    
    throw new ScrapingError(`Failed to fetch fighters: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      pageNumber: validatedPageNumber,
      originalError: error instanceof Error ? error.stack : String(error) 
    })
  }
}

function parseFighters($: cheerio.Root): FighterSummary[] {
  const fighters = []

  $('.c-listing-athlete-flipcard__inner').each((_, element) => {
    const $el = $(element)

    const nicknameRaw = $el.find('.c-listing-athlete__nickname .field__item').first().text().trim()
    const nickname = nicknameRaw ? nicknameRaw.replace(/^"+|"+$/g, '') : null

    const name = $el.find('.c-listing-athlete__name').first().text().replace(/\s+/g, ' ').trim()

    const weight = $el.find('.c-listing-athlete__title .field__item').first().text().trim() || null

    const recordText = $el.find('.c-listing-athlete__record').first().text().trim()
    let record = null

    if (recordText) {
      const match = recordText.match(/(\d+)-(\d+)-(\d+)/)
      if (match) {
        record = {
          wins: Number(match[1]),
          losses: Number(match[2]),
          draws: Number(match[3])
        }
      }
    }

    const href = $el.find('.c-listing-athlete-flipcard__action a').attr('href') || ''
    const slug = href.split('/').filter(Boolean).pop() || null

    fighters.push({ nickname, name, weight, record, slug })
  })

  return fighters
}
