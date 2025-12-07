import { beforeAll, describe, expect, test } from "bun:test";
import { ScrapingError, ValidationError } from "../src/errors/index.js";
import { getEvent } from "../src/scrapers/event.js";
import type { FightCard } from "../src/types/event.js";

describe("Event Scraper", () => {
  const validEventSlug = "ufc-294";
  let eventData: FightCard;

  beforeAll(async () => {
    eventData = await getEvent(validEventSlug);
  });

  describe("getEvent", () => {
    test("should successfully fetch event data for a valid slug", () => {
      const event = eventData;

      expect(event).toBeDefined();
      expect(Array.isArray(event)).toBe(true);
      expect(event.length).toBeGreaterThan(0);

      const firstFight = event[0];
      expect(firstFight).toHaveProperty("fightId");
      expect(firstFight).toHaveProperty("boutType");
      expect(firstFight).toHaveProperty("red");
      expect(firstFight).toHaveProperty("blue");
      expect(firstFight).toHaveProperty("result");
      expect(firstFight).toHaveProperty("awards");
    });

    test("should throw ValidationError for invalid slug", async () => {
      await expect(getEvent("")).rejects.toThrow(ValidationError);
      await expect(getEvent("invalid slug with spaces")).rejects.toThrow(
        ValidationError
      );
    });

    test("should throw ScrapingError for non-existent event", async () => {
      await expect(getEvent("ufc-nonexistent-event-12345")).rejects.toThrow(
        ScrapingError
      );
    }, 30_000);
  });
});
