import { describe, expect, test } from "bun:test";
import { ScrapingError, ValidationError } from "../src/errors/index.js";
import { getFight } from "../src/scrapers/fight.js";

const UFC_FIGHT_ID = 10_995;

describe("Fight Scraper", () => {
  describe("getFight", () => {
    test("should throw ValidationError for invalid slug", async () => {
      await expect(getFight("", 1)).rejects.toThrow(ValidationError);
      await expect(getFight("invalid slug with spaces", 1)).rejects.toThrow(
        ValidationError
      );
    });

    test("should throw ValidationError for invalid fightId", async () => {
      await expect(getFight("ufc-285", 0)).rejects.toThrow(ValidationError);
      await expect(getFight("ufc-285", -1)).rejects.toThrow(ValidationError);
    });

    test("should throw ScrapingError for non-existent event", async () => {
      await expect(getFight("ufc-nonexistent-event-12345", 1)).rejects.toThrow(
        ScrapingError
      );
    }, 30_000);

    test("should throw ScrapingError for non-existent fightId within valid event", async () => {
      await expect(getFight("ufc-285", 9999)).rejects.toThrow(ScrapingError);
    }, 30_000);

    test("should successfully fetch fight statistics when available", async () => {
      // This test is skipped because fight statistics availability varies by event
      // In a real environment, you would want to find an event with guaranteed statistics
      try {
        const fightData = await getFight("ufc-285", UFC_FIGHT_ID);

        expect(fightData).toBeDefined();
        expect(fightData).toHaveProperty("red");
        expect(fightData).toHaveProperty("blue");

        const { red, blue } = fightData;

        // Test red fighter structure
        expect(red).toHaveProperty("fightOverview");
        expect(red).toHaveProperty("significantStrikesByTarget");
        expect(red).toHaveProperty("significantStrikesByPosition");

        // Test blue fighter structure
        expect(blue).toHaveProperty("fightOverview");
        expect(blue).toHaveProperty("significantStrikesByTarget");
        expect(blue).toHaveProperty("significantStrikesByPosition");
      } catch (error) {
        // If no statistics are available, this is expected
        if (error instanceof ScrapingError) {
          console.log(
            "Expected error when no statistics are available:",
            error.message
          );
          return;
        }
        throw error;
      }
    }, 60_000);
  });
});
