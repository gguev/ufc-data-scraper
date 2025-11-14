import puppeteer from 'puppeteer'

const REQUEST_DELAY = 15000 // 15 seconds - UFC site delay
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
]

let lastRequestTime = 0

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function rateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime

  if (timeSinceLast < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLast
    console.log(`[RATE LIMIT] Waiting ${Math.round(waitTime / 1000)}s`)
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
        const backoffTime = Math.pow(2, attempt) * 1000
        console.log(`[RETRY] Retrying in ${backoffTime / 1000}s`)
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
