import type { Cheerio } from "cheerio";
import { load } from "cheerio";
import type { Element } from "domhandler";
import { ScrapingError, ValidationError } from "../errors/index.js";
import type { Corner, FightCard } from "../types/event.js";
import { fetchHtml } from "../utils/fetch.js";
import { validateSlug } from "../utils/validation.js";

const ODDS_REGEX = /^[+-]?\d+$/;

export async function getEvent(slug: string): Promise<FightCard> {
  const validatedSlug = validateSlug(slug, "slug");

  try {
    const url = `https://www.ufc.com/event/${validatedSlug}`;

    const html = await fetchHtml(url);
    const $ = load(html);

    const events = await parseEvent($);

    if (events.length === 0) {
      throw new ScrapingError("No fight data found on event page", { url });
    }

    return events;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error;
    }

    throw new ScrapingError(
      `Failed to fetch event data: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        slug: validatedSlug,
        originalError: error instanceof Error ? error.stack : String(error),
      }
    );
  }
}

function parseEvent($: ReturnType<typeof load>): FightCard {
  const fightRows = $(".c-listing-fight").toArray();

  const fights = fightRows.map((row: Element) => {
    const $row = $(row);

    const fightId = Number($row.attr("data-fmid")) ?? null;

    const boutType = $row
      .find(".c-listing-fight__class-text")
      .first()
      .text()
      .trim();

    const $redCorner = $row.find(".c-listing-fight__corner--red");
    const $blueCorner = $row.find(".c-listing-fight__corner--blue");

    const red = parseCorner($redCorner, $row, 0);
    const blue = parseCorner($blueCorner, $row, 1);

    const method =
      $row
        .find('.c-listing-fight__result-label:contains("Method")')
        .first()
        .next(".c-listing-fight__result-text")
        .text()
        .trim() || null;

    const roundText = $row
      .find('.c-listing-fight__result-label:contains("Round")')
      .first()
      .next(".c-listing-fight__result-text")
      .text();
    const round = roundText ? Number(roundText) : null;

    const time =
      $row
        .find('.c-listing-fight__result-label:contains("Time")')
        .first()
        .next(".c-listing-fight__result-text")
        .text()
        .trim() || null;

    const awards = $row
      .find(".c-listing-fight__banner--award .text")
      .map((_: number, el: Element) => $(el).text().trim())
      .get();

    return {
      fightId,
      boutType,
      red,
      blue,
      result: method && round !== null && time ? { method, round, time } : null,
      awards: awards.length ? awards : null,
    };
  });

  return fights;
}

function parseCorner(
  $corner: Cheerio<Element>,
  $row: Cheerio<Element>,
  index: 0 | 1
): Corner {
  const name = $row
    .find(".c-listing-fight__corner-name")
    .eq(index)
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const rankRaw =
    $corner.find(".js-listing-fight__corner-rank span").text().trim() ||
    $row
      .find(".js-listing-fight__corner-rank")
      .eq(index)
      .find("span")
      .text()
      .trim();

  let rank: "C" | number | null = null;
  if (rankRaw) {
    if (rankRaw === "C") {
      rank = "C";
    } else {
      const n = Number(rankRaw.replace("#", ""));
      rank = Number.isNaN(n) ? null : n;
    }
  }

  const oddsRaw = $row
    .find(".c-listing-fight__odds-amount")
    .eq(index)
    .text()
    .trim();
  const odds = oddsRaw && ODDS_REGEX.test(oddsRaw) ? oddsRaw : null;

  const country =
    $row.find(".c-listing-fight__country-text").eq(index).text().trim() || null;

  const outcome = (() => {
    if ($corner.find(".c-listing-fight__outcome--no-contest").length) {
      return "no contest";
    }
    if ($corner.find(".c-listing-fight__outcome--draw").length) {
      return "draw";
    }
    if ($corner.find(".c-listing-fight__outcome--win").length) {
      return "win";
    }
    if ($corner.find(".c-listing-fight__outcome--loss").length) {
      return "loss";
    }

    return null;
  })();

  const href = $corner.find("a").attr("href") || "";
  const slug = href.split("/").filter(Boolean).pop() || null;

  return { name, rank, odds, country, outcome, slug };
}
