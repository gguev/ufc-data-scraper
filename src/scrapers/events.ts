import * as cheerio from 'cheerio'
import { UNIX_TO_MS } from '../constants/index.js'
import { Event, EventList } from '../types/events.js'
import { fetchHtml } from '../utils/fetch.js'
import { ScrapingError, ValidationError } from '../errors/index.js'
import { validateNumber } from '../utils/validation.js'

const UPCOMING_EVENTS_SELECTOR = '#events-list-upcoming'
const PAST_EVENTS_SELECTOR = '#events-list-past'

export async function getUpcomingEvents(): Promise<EventList> {
  try {
    const url = 'https://www.ufc.com/events#events-list-upcoming'

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const events = parseEventCards($, UPCOMING_EVENTS_SELECTOR)

    return events
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error
    }
    
    throw new ScrapingError(`Failed to fetch upcoming events: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      url: 'https://www.ufc.com/events#events-list-upcoming',
      originalError: error instanceof Error ? error.stack : String(error) 
    })
  }
}

export async function getPastEvents(pageNumber: number = 0): Promise<EventList> {
  const validatedPageNumber = validateNumber(pageNumber, 'pageNumber', 0)
  
  try {
    const url = `https://www.ufc.com/events?page=${validatedPageNumber}`

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const events = parseEventCards($, PAST_EVENTS_SELECTOR)

    return events
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error
    }
    
    throw new ScrapingError(`Failed to fetch past events: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      url: `https://www.ufc.com/events?page=${validatedPageNumber}`,
      originalError: error instanceof Error ? error.stack : String(error) 
    })
  }
}

function parseEventCards($: cheerio.Root, cssSelector: string): EventList {
  const events: Event[] = []

  $(`${cssSelector} .c-card-event--result`).each((_, card) => {
    const $card = $(card)
    const headline = $card.find('.c-card-event--result__headline a').text().replace(/\s+/g, ' ').trim()
    const $dateDiv = $card.find('.c-card-event--result__date')
    const mainCardUnixTs = Number($dateDiv.attr('data-main-card-timestamp'))
    // const mainCardDate = $dateDiv.attr('data-main-card')
    const prelimUnixTs = Number($dateDiv.attr('data-prelims-card-timestamp'))
    const hasPrelims = Boolean(prelimUnixTs)
    //const prelimDate = $dateDiv.attr('data-prelims-card')
    const slug = $dateDiv.find('a').attr('href').slice(7) ?? ''
    const venue = $card.find('h5').text().trim()
    const locality = $card.find('.locality').text().trim() || null
    const administrativeArea = $card.find('.administrative-area').text().trim() || null
    const country = $card.find('.country').text().trim() || null

    events.push({
      event: {
        name: slugToEventName(slug),
        headline,
        date: new Date(mainCardUnixTs * UNIX_TO_MS).toISOString().split('T')[0],
        slug
      },
      mainCard: {
        dateTime: new Date(mainCardUnixTs * UNIX_TO_MS).toISOString(),
        unix: mainCardUnixTs
      },
      prelim: {
        dateTime: hasPrelims ? new Date(prelimUnixTs * UNIX_TO_MS).toISOString() : null,
        unix: hasPrelims ? prelimUnixTs : null
      },
      location: {
        venue,
        locality,
        administrativeArea,
        country
      }
    })
  })

  return events
}

export function slugToEventName(slug: string): string {
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
