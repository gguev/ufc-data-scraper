import puppeteer from 'puppeteer'

export async function getFight(slug: string, fightId: number) {
  const URL = `https://www.ufc.com/event/${slug}#${fightId}`

  try {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    console.log(`[PUPPETEER] Fetching: ${URL}`)

    await page.goto(URL, {
      waitUntil: 'networkidle2',
    })

    await page.waitForSelector('.details-content__iframe-wrapper iframe')

    const frames = await page.$$eval(
      '.details-content__iframe-wrapper iframe',
      (frames) =>
        Array.from(frames).map((f: HTMLIFrameElement) => f.src)
    )

    for (const src of frames) {
      const frame = page
        .frames()
        .find((f) => f.url().includes(src) || f.url().endsWith(src))

      if (!frame) continue

      const data = await frame.evaluate(() => {
        const redFightOverview = document.querySelectorAll(
          '.red .c-stat-metric-compare__number'
        )

        const blueFightOverview = document.querySelectorAll(
          '.blue .c-stat-metric-compare__number'
        )

        const redSigHead = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_head_value'
        )

        const blueSigHead = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_head_value'
        )

        const redSigBody = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_body_value'
        )
        const blueSigBody = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_body_value'
        )

        const redSigLeg = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_leg_value'
        )

        const blueSigLeg = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_leg_value'
        )

        const redPercent = document.querySelectorAll('.red .percent')
        const redAttempted = document.querySelectorAll('.red .attempted')

        const bluePercent = document.querySelectorAll('.blue .percent')
        const blueAttempted = document.querySelectorAll('.blue .attempted')

        const redHeadPercent = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_head_percent'
        )
        const blueHeadPercent = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_head_percent'
        )

        const redBodyPercent = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_body_percent'
        )
        const blueBodyPercent = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_body_percent'
        )

        const redLegPercent = document.querySelectorAll(
          '.red #e-stat-body_x5F__x5F_leg_percent'
        )
        const blueLegPercent = document.querySelectorAll(
          '.blue #e-stat-body_x5F__x5F_leg_percent'
        )

        return {
          redFightOverview: Array.from(redFightOverview, (n) =>
            n.textContent.trim()
          ),
          blueFightOverview: Array.from(blueFightOverview, (n) =>
            n.textContent.trim()
          ),
          redSigHead: Array.from(redSigHead, (n) => n.textContent.trim()),
          blueSigHead: Array.from(blueSigHead, (n) => n.textContent.trim()),
          redSigBody: Array.from(redSigBody, (n) => n.textContent.trim()),
          blueSigBody: Array.from(blueSigBody, (n) => n.textContent.trim()),
          redSigLeg: Array.from(redSigLeg, (n) => n.textContent.trim()),
          blueSigLeg: Array.from(blueSigLeg, (n) => n.textContent.trim()),
          redPercent: Array.from(redPercent, (n) => n.textContent.trim()),
          redAttempted: Array.from(redAttempted, (n) => n.textContent.trim()),
          bluePercent: Array.from(bluePercent, (n) => n.textContent.trim()),
          blueAttempted: Array.from(blueAttempted, (n) => n.textContent.trim()),
          redHeadPercent: Array.from(redHeadPercent, (n) =>
            n.textContent.trim()
          ),
          blueHeadPercent: Array.from(blueHeadPercent, (n) =>
            n.textContent.trim()
          ),
          redBodyPercent: Array.from(redBodyPercent, (n) =>
            n.textContent.trim()
          ),
          blueBodyPercent: Array.from(blueBodyPercent, (n) =>
            n.textContent.trim()
          ),
          redLegPercent: Array.from(redLegPercent, (n) => n.textContent.trim()),
          blueLegPercent: Array.from(blueLegPercent, (n) =>
            n.textContent.trim()
          ),
        }
      })

      function buildAllSections(data) {
        const chunk = (size, arr) =>
          Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
          )

        const zipFight = (raw, pct, att) =>
          raw.map((v, i) => ({
            landed: Number(v),
            percent: pct[i]
              ? parseFloat(pct[i].replace(/[()%]/g, '')) / 100
              : null,
            attempted: att[i]
              ? parseInt(att[i].replace(/\D/g, '') || '0', 10)
              : null,
          }))

        const zipTarget = (h, b, l, hp, bp, lp) =>
          h.map((_, i) => ({
            head: {
              landed: Number(h[i]),
              percent: hp[i]
                ? parseFloat(hp[i].replace(/[()%]/g, '')) / 100
                : null,
            },
            body: {
              landed: Number(b[i]),
              percent: bp[i]
                ? parseFloat(bp[i].replace(/[()%]/g, '')) / 100
                : null,
            },
            leg: {
              landed: Number(l[i]),
              percent: lp[i]
                ? parseFloat(lp[i].replace(/[()%]/g, '')) / 100
                : null,
            },
          }))

        const totalRounds = data.redFightOverview.length / (6 + 3)

        const zipRed = zipFight(
          data.redFightOverview,
          data.redPercent,
          data.redAttempted
        )
        const zipBlue = zipFight(
          data.blueFightOverview,
          data.bluePercent,
          data.blueAttempted
        )

        const fightEnd = totalRounds * 6
        const redFight = chunk(6, zipRed.slice(0, fightEnd))
        const blueFight = chunk(6, zipBlue.slice(0, fightEnd))

        const redPos = chunk(
          3,
          zipRed.slice(fightEnd, fightEnd + totalRounds * 3)
        )
        const bluePos = chunk(
          3,
          zipBlue.slice(fightEnd, fightEnd + totalRounds * 3)
        )

        const redTarget = zipTarget(
          data.redSigHead,
          data.redSigBody,
          data.redSigLeg,
          data.redHeadPercent,
          data.redBodyPercent,
          data.redLegPercent
        )
        const blueTarget = zipTarget(
          data.blueSigHead,
          data.blueSigBody,
          data.blueSigLeg,
          data.blueHeadPercent,
          data.blueBodyPercent,
          data.blueLegPercent
        )

        const mapFight = (c) => ({
          totalStrikes: c[0],
          takedowns: c[1],
          submissionAttempts: c[2],
          reversals: c[3],
          significantStrikes: c[4],
          knockdowns: c[5],
        })
        const mapPos = (c) => ({
          distance: c[0],
          clinch: c[1],
          ground: c[2],
        })

        const wrap = (blocks, mapper) => ({
          fullFight: mapper(blocks[0]),
          rounds: blocks
            .slice(1)
            .map((b, i) => ({ round: i + 1, ...mapper(b) })),
        })

        return {
          red: {
            fightOverview: wrap(redFight, mapFight),
            significantStrikesByTarget: wrap(redTarget, (t) => t),
            significantStrikesByPosition: wrap(redPos, mapPos),
          },
          blue: {
            fightOverview: wrap(blueFight, mapFight),
            significantStrikesByTarget: wrap(blueTarget, (t) => t),
            significantStrikesByPosition: wrap(bluePos, mapPos),
          },
        }
      }

      await browser.close()
      return buildAllSections(data)
    }
  } catch (err) {
    console.log(err)
  }
}
