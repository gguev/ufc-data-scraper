import { type Cheerio, type CheerioAPI, load } from "cheerio";
import type { Element } from "domhandler";
import { DECIMAL_RADIX } from "../constants/index.js";
import { ScrapingError, ValidationError } from "../errors/index.js";
import type { FighterRecordList } from "../types/fighter-record.js";
import { fetchHtml } from "../utils/fetch.js";
import { validateNumber, validateSlug } from "../utils/validation.js";
import { slugToEventName } from "./events.js";

// Top-level regex for performance
const EVENT_PATH_REGEX = /^\/event\//;

export async function getFighterRecord(
  fighterSlug: string,
  pageNumber = 0
): Promise<FighterRecordList> {
  const validatedSlug = validateSlug(fighterSlug, "fighterSlug");
  const validatedPageNumber = validateNumber(pageNumber, "pageNumber", 0);

  try {
    const url = `https://www.ufc.com/athlete/${validatedSlug}?page=${validatedPageNumber}`;

    const html = await fetchHtml(url);
    const $ = load(html);

    const record = parseFighterRecord($);

    return record;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ScrapingError) {
      throw error;
    }

    throw new ScrapingError(
      `Failed to fetch fighter record: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        slug: validatedSlug,
        pageNumber: validatedPageNumber,
        originalError: error instanceof Error ? error.stack : String(error),
      }
    );
  }
}

function parseFighterRecord($: CheerioAPI): FighterRecordList {
  const fights: FighterRecordList = [];

  $("li.l-listing__item article.c-card-event--athlete-results").each(
    (_index: number, card: Element) => {
      const $card = $(card);

      const $red = $card.find(".c-card-event--athlete-results__red-image");
      const $blue = $card.find(".c-card-event--athlete-results__blue-image");
      const result = (el: Cheerio<Element>) => {
        if (el.hasClass("win")) {
          return "win";
        }
        if (el.hasClass("loss")) {
          return "loss";
        }
        return "draw";
      };

      const method = $card
        .find('.c-card-event--athlete-results__result-label:contains("Method")')
        .next()
        .text()
        .trim();
      const round = Number.parseInt(
        $card
          .find(
            '.c-card-event--athlete-results__result-label:contains("Round")'
          )
          .next()
          .text()
          .trim(),
        DECIMAL_RADIX
      );
      const time = $card
        .find('.c-card-event--athlete-results__result-label:contains("Time")')
        .next()
        .text()
        .trim();

      const eventPath =
        $card
          .find('.c-card-event--athlete-results__actions a[href*="/event/"]')
          .attr("href") || "";

      const url = new URL(eventPath);
      const clean = url.pathname + url.hash;
      const [eventSlug, fightId] = clean
        .replace(EVENT_PATH_REGEX, "")
        .split("#");

      const eventDate = $card
        .find(".c-card-event--athlete-results__date")
        .text()
        .trim();

      const redName = $red.find("img").attr("alt")?.trim() || "";
      const redSlug =
        $red.find("a").attr("href")?.split("/").pop()?.trim() || "";

      const blueName = $blue.find("img").attr("alt")?.trim() || "";
      const blueSlug =
        $blue.find("a").attr("href")?.split("/").pop()?.trim() || "";

      fights.push({
        fightId: Number(fightId || "0"),
        event: {
          name: slugToEventName(eventSlug || ""),
          slug: eventSlug || "",
          date: new Date(eventDate).toISOString().split("T")[0] || "",
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
      });
    }
  );

  return fights;
}
