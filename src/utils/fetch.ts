import puppeteer from 'puppeteer'
import { BROWSER_TIMEOUT, EXPONENTIAL_BACKOFF_BASE, MS_TO_S, REQUEST_DELAY, USER_AGENTS } from '../constants/index.js'

let lastRequestTime = 0

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function rateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime

  if (timeSinceLast < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLast
    console.log(`[RATE LIMIT] Waiting ${Math.round(waitTime / MS_TO_S)}s`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
}

export async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await rateLimit()
      console.log(`[PUPPETEER] Fetching: ${url} (Attempt ${attempt})`)

      const html = await fetchWithPuppeteer(url)
      lastRequestTime = Date.now()
      return html
    } catch (error) {
      console.error(`[ERROR] Puppeteer failed:`, error.message)

      if (attempt < retries) {
        const backoffTime = Math.pow(EXPONENTIAL_BACKOFF_BASE, attempt) * MS_TO_S
        console.log(`[RETRY] Retrying in ${backoffTime / MS_TO_S}s`)
        await new Promise((resolve) => setTimeout(resolve, backoffTime))
      }
    }
  }
  throw new Error(`All ${retries} attempts failed for URL: ${url}`)
}

export async function fetchWithPuppeteer(url: string): Promise<string> {
  const browser = await puppeteer.launch({
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

  try {
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
  } finally {
    await browser.close()
  }
}
