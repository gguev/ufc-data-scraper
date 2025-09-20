// src/index.ts - Fixed imports and simplified
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer-extra'

// ===== CONFIGURATION =====
const REQUEST_DELAY = 16000 // 16 seconds
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
]

const requestCache = new Map()
let lastRequestTime = 0

// ===== UTILITY FUNCTIONS =====
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function rateLimit() {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime

  if (timeSinceLast < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLast
    console.log(`[RATE LIMIT] Waiting ${Math.round(waitTime / 1000)}s`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

// ===== PUPPETEER FETCHER =====
async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await rateLimit()
      console.log(`[PUPPETEER] Fetching: ${url} (Attempt ${attempt})`)

      const html = await fetchWithPuppeteer(url)
      lastRequestTime = Date.now()
      return html
    } catch (error) {
      console.error(`[ERROR] Puppeteer failed:`, (error as Error).message)

      if (attempt < retries) {
        const backoffTime = Math.pow(2, attempt) * 1000
        console.log(`[RETRY] Retrying in ${backoffTime / 1000}s`)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))
      }
    }
  }
  throw new Error(`All ${retries} attempts failed for URL: ${url}`)
}

async function fetchWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
    ],
    defaultViewport: null,
    timeout: 60000,
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(getRandomUserAgent())
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.google.com/',
    })

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    })

    return await page.content()
  } finally {
    await browser.close()
  }
}

// ===== PARSING FUNCTIONS =====
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

// ===== FIGHTER FUNCTIONS =====
export async function getFighter(fighterURL) {
  try {
    // const cacheKey = `fighter:${fighterName.toLowerCase()}`;

    // if (requestCache.has(cacheKey)) {
    //   console.log(`[CACHE] Returning cached fighter data for ${fighterName}`);
    //   return requestCache.get(cacheKey);
    // }

    // const formattedName = fighterName.replace(/\s+/g, '-').toLowerCase();
    // const url = `https://www.ufc.com/athlete/${formattedName}`;

    const cacheKey = `fighter:${fighterURL}`

    if (requestCache.has(cacheKey)) {
      console.log(`[CACHE] Returning cached fighter data for ${fighterURL}`)
      return requestCache.get(cacheKey)
    }

    const url = fighterURL

    const html = await fetchHtml(url)
    const $ = cheerio.load(html)

    const fighterData = {
      url,
      FighterInfo: parseFighterInfo($),
      FighterStats: parseFighterStats($),
    }

    requestCache.set(cacheKey, fighterData)
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

// ===== RANKINGS FUNCTION =====
export async function getRankings() {
  try {
    const cacheKey = 'rankings'
    if (requestCache.has(cacheKey)) {
      console.log('[CACHE] Returning cached rankings')
      return requestCache.get(cacheKey)
    }

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

          // const fighter = $(row).find('.views-field-title a').text().trim();

          // NEW FIX FOR EDGE CASES //
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

    requestCache.set(cacheKey, rankingsDict)
    return rankingsDict
  } catch (error) {
    console.error(`[FATAL] Error scraping rankings:`, error)
    return null
  }
}

// ===== TITLEHOLDERS FUNCTION =====
export async function getTitleholders() {
  const cacheKey = 'titleholders'
  try {
    if (requestCache.has(cacheKey)) {
      console.log('[CACHE] Returning cached titleholders')
      return requestCache.get(cacheKey)
    }

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
      const champUrl = new URL(champAnchor.attr('href'), 'https://www.ufc.com')
        .href

      const champNickname = $(element)
        .find('.ath-nn__nickname .field__item')
        .text()
        .trim()
        .replace(/^"|"$/g, '')
      const champRecord = $(element).find('.c-ath--record').text().trim()
      const champLastFight = $(element)
        .find('.view-fighter-last-fight .view-content .views-row')
        .first()
        .text()
        .trim()

      if (division) {
        titleholdersDict[division] = {
          Weight: weight,
          ChampName: champName,
          ChampUrl: champUrl,
          ChampNickname: champNickname,
          ChampRecord: champRecord,
          ChampLastFight: champLastFight,
        }
      }
    })

    requestCache.set(cacheKey, titleholdersDict)
    return titleholdersDict
  } catch (error) {
    console.error(`[FATAL] Error scraping titleholders:`, error)
    return null
  }
}

export default {
  getFighter,
  getFighterInfo,
  getFighterStats,
  getRankings,
  getTitleholders,
}
