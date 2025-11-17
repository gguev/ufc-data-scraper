import * as cheerio from 'cheerio'
import { fetchHtml } from '../utils/fetch.js'

export async function getFighterRecord(
  fighterSlug: string,
  pageNumber: number = 0
) {
  try {
    const url = `https://www.ufc.com/athlete/${fighterSlug}?page=${pageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    return parseFighterRecord($)
  } catch (err) {}
}

function parseFighterRecord($: cheerio.Root) {
  const fights = []

  $('li.l-listing__item article.c-card-event--athlete-results').each(
    (_, card) => {
      const $card = $(card)

      const $red = $card.find('.c-card-event--athlete-results__red-image')
      const $blue = $card.find('.c-card-event--athlete-results__blue-image')
      const result = (el: cheerio.Cheerio) =>
        el.hasClass('win') ? 'win' : el.hasClass('loss') ? 'loss' : 'draw'

      const method = $card
        .find('.c-card-event--athlete-results__result-label:contains("Method")')
        .next()
        .text()
        .trim()
      const round = parseInt(
        $card
          .find(
            '.c-card-event--athlete-results__result-label:contains("Round")'
          )
          .next()
          .text()
          .trim(),
        10
      )
      const time = $card
        .find('.c-card-event--athlete-results__result-label:contains("Time")')
        .next()
        .text()
        .trim()

      const eventPath =
        $card
          .find('.c-card-event--athlete-results__actions a[href*="/event/"]')
          .attr('href') || ''

      const url = new URL(eventPath)
      const clean = url.pathname + url.hash
      const [eventSlug, fightId] = clean.replace(/^\/event\//, '').split('#')

      const eventDate = $card
        .find('.c-card-event--athlete-results__date')
        .text()
        .trim()

      const redName = $red.find('img').attr('alt')?.trim() || ''
      const redSlug =
        $red.find('a').attr('href')?.split('/').pop()?.trim() || ''

      const blueName = $blue.find('img').attr('alt')?.trim() || ''
      const blueSlug =
        $blue.find('a').attr('href')?.split('/').pop()?.trim() || ''

      fights.push({
        fightId: Number(fightId),
        event: {
          name: slugToEventName(eventSlug),
          slug: eventSlug,
          date: new Date(eventDate).toISOString().split('T')[0],
        },
        red: {
          name: redName,
          slug: redSlug,
          result: result($red),
        },
        blue: {
          name: blueName,
          slug: blueSlug,
          result: result($blue),
        },
        result: { method, round, time },
      })
    }
  )

  return fights
}

function slugToEventName(slug: string): string {
  const s = slug.replace(/^\/|\/$/g, '')
  if (s.startsWith('ufc-') && /^\d+$/.test(s.slice(4))) {
    return `UFC ${s.slice(4)}`
  }
  if (s.startsWith('ufc-fight-night')) return 'UFC Fight Night'

  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
