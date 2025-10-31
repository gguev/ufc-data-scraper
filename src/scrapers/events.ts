import * as cheerio from 'cheerio'
import { Event } from '../types/events.js'
import { fetchHtml } from '../utils/fetch.js'

const UPCOMING_EVENTS_SELECTOR = '#events-list-upcoming'
const PAST_EVENTS_SELECTOR = '#events-list-past'

export async function getUpcomingEvents(): Promise<Event[] | null> {
  try {
    const url = 'https://www.ufc.com/events#events-list-upcoming'

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    return parseEventCards($, UPCOMING_EVENTS_SELECTOR)
  } catch (err) {}
}

export async function getPastEvents(
  pageNumber: Number = 0
): Promise<Event[] | null> {
  try {
    const url = `https://www.ufc.com/events?page=${pageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    return parseEventCards($, PAST_EVENTS_SELECTOR)
  } catch (err) {}
}

function parseEventCards($: cheerio.Root, cssSelector: string): Event[] {
  const events: Event[] = []

  $(`${cssSelector} .c-card-event--result`).each((_, card) => {
    const $card = $(card)
    const headline = $card
      .find('.c-card-event--result__headline a')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
    const $dateDiv = $card.find('.c-card-event--result__date')
    const mainCardUnixTs = Number($dateDiv.attr('data-main-card-timestamp'))
    // const mainCardDate = $dateDiv.attr('data-main-card')
    const prelimUnixTs = Number($dateDiv.attr('data-prelims-card-timestamp'))
    const hasPrelims = Boolean(prelimUnixTs)
    //const prelimDate = $dateDiv.attr('data-prelims-card')
    const slug = $dateDiv.find('a').attr('href').slice(7) ?? ''
    const venue = $card.find('h5').text().trim()
    const locality = $card.find('.locality').text().trim() || null
    const administrativeArea =
      $card.find('.administrative-area').text().trim() || null
    const country = $card.find('.country').text().trim() || null

    events.push({
      eventName: slugToEventName(slug),
      headline,
      mainCard: {
        dateTime: new Date(mainCardUnixTs * 1000).toISOString(),
        unix: mainCardUnixTs,
      },
      prelim: {
        dateTime: hasPrelims
          ? new Date(prelimUnixTs * 1000).toISOString()
          : null,
        unix: hasPrelims ? prelimUnixTs : null,
      },
      slug,
      location: {
        venue,
        locality,
        administrativeArea,
        country,
      },
    })
  })

  return events
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
