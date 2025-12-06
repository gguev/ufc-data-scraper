import puppeteer from "puppeteer";
import {
  DECIMAL_RADIX,
  FIGHT_STATS_CHUNK_SIZE,
  PERCENT_MULTIPLIER,
  POSITION_STATS_CHUNK_SIZE,
} from "../constants/index.js";
import { ScrapingError, ValidationError } from "../errors/index.js";
import type { FightStats } from "../types/fight.js";
import { rateLimit, updateLastRequestTime } from "../utils/fetch.js";
import { validateNumber, validateSlug } from "../utils/validation.js";

function extractFrameData(frame: unknown): Promise<unknown> {
  return (
    frame as { evaluate: (fn: () => unknown) => Promise<unknown> }
  ).evaluate(() => {
    const redFightOverview = document.querySelectorAll(
      ".red .c-stat-metric-compare__number"
    );

    const blueFightOverview = document.querySelectorAll(
      ".blue .c-stat-metric-compare__number"
    );

    const redSigHead = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_head_value"
    );

    const blueSigHead = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_head_value"
    );

    const redSigBody = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_body_value"
    );
    const blueSigBody = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_body_value"
    );

    const redSigLeg = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_leg_value"
    );

    const blueSigLeg = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_leg_value"
    );

    const redPercent = document.querySelectorAll(".red .percent");
    const redAttempted = document.querySelectorAll(".red .attempted");

    const bluePercent = document.querySelectorAll(".blue .percent");
    const blueAttempted = document.querySelectorAll(".blue .attempted");

    const redHeadPercent = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_head_percent"
    );
    const blueHeadPercent = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_head_percent"
    );

    const redBodyPercent = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_body_percent"
    );
    const blueBodyPercent = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_body_percent"
    );

    const redLegPercent = document.querySelectorAll(
      ".red #e-stat-body_x5F__x5F_leg_percent"
    );
    const blueLegPercent = document.querySelectorAll(
      ".blue #e-stat-body_x5F__x5F_leg_percent"
    );

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
      redHeadPercent: Array.from(redHeadPercent, (n) => n.textContent.trim()),
      blueHeadPercent: Array.from(blueHeadPercent, (n) => n.textContent.trim()),
      redBodyPercent: Array.from(redBodyPercent, (n) => n.textContent.trim()),
      blueBodyPercent: Array.from(blueBodyPercent, (n) => n.textContent.trim()),
      redLegPercent: Array.from(redLegPercent, (n) => n.textContent.trim()),
      blueLegPercent: Array.from(blueLegPercent, (n) => n.textContent.trim()),
    };
  });
}

async function extractFightData(url: string): Promise<unknown> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--start-maximized",
      "--disable-blink-features=AutomationControlled",
    ],
    defaultViewport: null,
    timeout: 5000,
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.google.com/",
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 5000,
    });

    await page.waitForSelector(".details-content__iframe-wrapper iframe", {
      timeout: 5000,
    });

    const frames = await page.$$eval(
      ".details-content__iframe-wrapper iframe",
      (iframeElements: HTMLIFrameElement[]) =>
        Array.from(iframeElements).map((f: HTMLIFrameElement) => f.src)
    );

    if (frames.length === 0) {
      throw new ScrapingError("No fight statistics frames found on the page", {
        url,
      });
    }

    for (const src of frames) {
      const frame = page
        .frames()
        .find((f) => f.url().includes(src) || f.url().endsWith(src));

      if (!frame) {
        continue;
      }

      const data = await extractFrameData(frame);
      await browser.close();
      return data;
    }

    throw new ScrapingError("No valid fight statistics found in any frame", {
      url,
      framesFound: frames.length,
    });
  } finally {
    try {
      await browser.close();
    } catch {
      // Ignore cleanup errors
    }
  }
}

function buildAllSections(fightData: {
  redFightOverview: string[];
  blueFightOverview: string[];
  redSigHead: string[];
  blueSigHead: string[];
  redSigBody: string[];
  blueSigBody: string[];
  redSigLeg: string[];
  blueSigLeg: string[];
  redPercent: string[];
  redAttempted: string[];
  bluePercent: string[];
  blueAttempted: string[];
  redHeadPercent: string[];
  blueHeadPercent: string[];
  redBodyPercent: string[];
  blueBodyPercent: string[];
  redLegPercent: string[];
  blueLegPercent: string[];
}): FightStats {
  const chunk = <T>(size: number, arr: T[]) =>
    Array.from(
      { length: Math.ceil(arr.length / size) },
      (_: unknown, i: number) => arr.slice(i * size, i * size + size)
    );

  const zipFight = (raw: string[], pct: string[], att: string[]) =>
    raw.map((v: string, i: number) => ({
      landed: Number(v),
      percent: pct[i]
        ? Number.parseFloat(pct[i].replace(/[()%]/g, "")) / PERCENT_MULTIPLIER
        : null,
      attempted: att[i]
        ? Number.parseInt(att[i].replace(/\D/g, "") || "0", DECIMAL_RADIX)
        : null,
    }));

  const zipTargetParams = {
    h: fightData.redSigHead,
    b: fightData.redSigBody,
    l: fightData.redSigLeg,
    hp: fightData.redHeadPercent,
    bp: fightData.redBodyPercent,
    lp: fightData.redLegPercent,
  };

  const zipTarget = () =>
    zipTargetParams.h.map((_: unknown, i: number) => ({
      head: {
        landed: Number(zipTargetParams.h[i]),
        percent: zipTargetParams.hp[i]
          ? Number.parseFloat(zipTargetParams.hp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
      body: {
        landed: Number(zipTargetParams.b[i]),
        percent: zipTargetParams.bp[i]
          ? Number.parseFloat(zipTargetParams.bp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
      leg: {
        landed: Number(zipTargetParams.l[i]),
        percent: zipTargetParams.lp[i]
          ? Number.parseFloat(zipTargetParams.lp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
    }));

  const totalRounds =
    fightData.redFightOverview.length /
    (FIGHT_STATS_CHUNK_SIZE + POSITION_STATS_CHUNK_SIZE);

  const zipRed = zipFight(
    fightData.redFightOverview,
    fightData.redPercent,
    fightData.redAttempted
  );
  const zipBlue = zipFight(
    fightData.blueFightOverview,
    fightData.bluePercent,
    fightData.blueAttempted
  );

  const fightEnd = totalRounds * FIGHT_STATS_CHUNK_SIZE;
  const redFight = chunk(FIGHT_STATS_CHUNK_SIZE, zipRed.slice(0, fightEnd));
  const blueFight = chunk(FIGHT_STATS_CHUNK_SIZE, zipBlue.slice(0, fightEnd));

  const redPos = chunk(
    POSITION_STATS_CHUNK_SIZE,
    zipRed.slice(fightEnd, fightEnd + totalRounds * POSITION_STATS_CHUNK_SIZE)
  );
  const bluePos = chunk(
    POSITION_STATS_CHUNK_SIZE,
    zipBlue.slice(fightEnd, fightEnd + totalRounds * POSITION_STATS_CHUNK_SIZE)
  );

  const redTarget = zipTarget();

  const blueTargetParams = {
    h: fightData.blueSigHead,
    b: fightData.blueSigBody,
    l: fightData.blueSigLeg,
    hp: fightData.blueHeadPercent,
    bp: fightData.blueBodyPercent,
    lp: fightData.blueLegPercent,
  };

  const blueTarget = () =>
    blueTargetParams.h.map((_: unknown, i: number) => ({
      head: {
        landed: Number(blueTargetParams.h[i]),
        percent: blueTargetParams.hp[i]
          ? Number.parseFloat(blueTargetParams.hp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
      body: {
        landed: Number(blueTargetParams.b[i]),
        percent: blueTargetParams.bp[i]
          ? Number.parseFloat(blueTargetParams.bp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
      leg: {
        landed: Number(blueTargetParams.l[i]),
        percent: blueTargetParams.lp[i]
          ? Number.parseFloat(blueTargetParams.lp[i].replace(/[()%]/g, "")) /
            PERCENT_MULTIPLIER
          : null,
      },
    }));

  const mapFight = (c: unknown[]) => ({
    totalStrikes: c[0],
    takedowns: c[1],
    submissionAttempts: c[2],
    reversals: c[3],
    significantStrikes: c[4],
    knockdowns: c[5],
  });

  const mapPos = (c: unknown[]) => ({
    distance: c[0],
    clinch: c[1],
    ground: c[2],
  });

  const wrap = (
    blocks: unknown[][],
    mapper: (c: unknown[]) => Record<string, unknown>
  ) => ({
    fullFight: mapper(blocks[0] || []),
    rounds: blocks
      .slice(1)
      .map((b: unknown[], i: number) => ({ round: i + 1, ...mapper(b) })),
  });

  return {
    red: {
      fightOverview: wrap(redFight, mapFight),
      significantStrikesByTarget: {
        fullFight: redTarget[0],
        rounds: redTarget.slice(1).map((t, i) => ({ round: i + 1, ...t })),
      },
      significantStrikesByPosition: wrap(redPos, mapPos),
    },
    blue: {
      fightOverview: wrap(blueFight, mapFight),
      significantStrikesByTarget: {
        fullFight: blueTarget()[0],
        rounds: blueTarget()
          .slice(1)
          .map((t, i) => ({ round: i + 1, ...t })),
      },
      significantStrikesByPosition: wrap(bluePos, mapPos),
    },
  } as FightStats;
}

export async function getFight(
  slug: string,
  fightId: number
): Promise<FightStats> {
  const validatedSlug = validateSlug(slug, "slug");
  const validatedFightId = validateNumber(fightId, "fightId", 1);

  const url = `https://www.ufc.com/event/${validatedSlug}#${validatedFightId}`;

  try {
    await rateLimit();

    console.log(`[PUPPETEER] Fetching: ${url}`);

    const data = await extractFightData(url);

    updateLastRequestTime();

    return buildAllSections(
      data as {
        redFightOverview: string[];
        blueFightOverview: string[];
        redSigHead: string[];
        blueSigHead: string[];
        redSigBody: string[];
        blueSigBody: string[];
        redSigLeg: string[];
        blueSigLeg: string[];
        redPercent: string[];
        redAttempted: string[];
        bluePercent: string[];
        blueAttempted: string[];
        redHeadPercent: string[];
        blueHeadPercent: string[];
        redBodyPercent: string[];
        blueBodyPercent: string[];
        redLegPercent: string[];
        blueLegPercent: string[];
      }
    );
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ScrapingError) {
      throw err;
    }

    throw new ScrapingError(
      `Failed to fetch fight data: ${err instanceof Error ? err.message : "Unknown error"}`,
      {
        url,
        originalError: err instanceof Error ? err.stack : String(err),
      }
    );
  }
}
