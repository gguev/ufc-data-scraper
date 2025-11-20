import puppeteer from 'puppeteer'
import { NetworkError } from '../errors/index.js'

const MS_TO_S = 1000
const BROWSER_TIMEOUT = 5000
const EXPONENTIAL_BACKOFF_BASE = 2
export const REQUEST_DELAY = 15000 // 15 seconds - UFC site delay
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
]

let lastRequestTime = 0

export function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

export function updateLastRequestTime() {
  lastRequestTime = Date.now()
}

export async function rateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime

  if (timeSinceLast < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLast
    console.log(`[RATE LIMIT] Waiting ${Math.round(waitTime / MS_TO_S)}s`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

export async function fetchHtml(url: string, retries = 3): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await rateLimit()
      console.log(`[PUPPETEER] Fetching: ${url} (Attempt ${attempt})`)

      const html = await fetchWithPuppeteer(url)
      updateLastRequestTime()
      return html
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`[ERROR] Puppeteer failed:`, lastError.message)

      if (attempt < retries) {
        const backoffTime = Math.pow(EXPONENTIAL_BACKOFF_BASE, attempt) * MS_TO_S
        console.log(`[RETRY] Retrying in ${backoffTime / MS_TO_S}s`)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))
      }
    }
  }
  
  throw new NetworkError(`All ${retries} attempts failed for URL: ${url}`, url, undefined)
}

export async function fetchWithPuppeteer(url: string): Promise<string> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--start-maximized',
        '--disable-blink-features=AutomationControlled'
      ],
      defaultViewport: null,
      timeout: BROWSER_TIMEOUT
    })

    const page = await browser.newPage()
    await page.setUserAgent(getRandomUserAgent())
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.google.com/'
    })

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: BROWSER_TIMEOUT
    })

    return await page.content()
  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      throw new NetworkError(`Request timeout: ${url}`, url, undefined)
    }
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
