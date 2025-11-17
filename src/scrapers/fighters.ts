import * as cheerio from 'cheerio'
import { FighterSummary } from '../types/fighters.js'
import { fetchHtml } from '../utils/fetch.js'

export async function getFighters(
  pageNumber: number = 0
): Promise<FighterSummary[] | null> {
  try {
    const url = `https://www.ufc.com/athletes/all?page=${pageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    return parseFighters($)
  } catch (error) {}
}

function parseFighters($: cheerio.Root): FighterSummary[] {
  const fighters = []

  $('.c-listing-athlete-flipcard__inner').each((_, element) => {
    const $el = $(element)

    const nicknameRaw = $el
      .find('.c-listing-athlete__nickname .field__item')
      .first()
      .text()
      .trim()
    const nickname = nicknameRaw ? nicknameRaw.replace(/^"+|"+$/g, '') : null

    const name = $el
      .find('.c-listing-athlete__name')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim()

    const weight =
      $el
        .find('.c-listing-athlete__title .field__item')
        .first()
        .text()
        .trim() || null

    const recordText = $el
      .find('.c-listing-athlete__record')
      .first()
      .text()
      .trim()
    let record = null

    if (recordText) {
      const match = recordText.match(/(\d+)-(\d+)-(\d+)/)
      if (match) {
        record = {
          wins: Number(match[1]),
          losses: Number(match[2]),
          draws: Number(match[3]),
        }
      }
    }

    const href =
      $el.find('.c-listing-athlete-flipcard__action a').attr('href') || ''
    const slug = href.split('/').filter(Boolean).pop() || null

    fighters.push({ nickname, name, weight, record, slug })
  })

  return fighters
}
