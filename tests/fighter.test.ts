import { beforeAll, describe, expect, test } from "bun:test";
import { ValidationError } from "../src/errors/index.js";
import { getFighter } from "../src/scrapers/fighter.js";
import type { Fighter } from "../src/types/fighter.js";

describe("Fighter Scraper", () => {
  const validFighterSlug = "jon-jones";
  let fighterData: Fighter;

  beforeAll(async () => {
    fighterData = await getFighter(validFighterSlug);
  });

  describe("getFighter", () => {
    test("should successfully fetch fighter data for a valid slug", () => {
      expect(fighterData).toBeDefined();
      expect(fighterData).toHaveProperty("info");
      expect(fighterData).toHaveProperty("stats");

      const { info, stats } = fighterData;

      // Test info properties
      expect(info).toHaveProperty("name");
      expect(info).toHaveProperty("nickname");
      expect(info).toHaveProperty("status");
      expect(info).toHaveProperty("rank");
      expect(info).toHaveProperty("age");
      expect(info).toHaveProperty("height");
      expect(info).toHaveProperty("weight");
      expect(info).toHaveProperty("armReach");
      expect(info).toHaveProperty("legReach");
      expect(info).toHaveProperty("fightingStyle");
      expect(info).toHaveProperty("division");
      expect(info).toHaveProperty("placeOfBirth");
      expect(info).toHaveProperty("trainingCamp");
      expect(info).toHaveProperty("octagonDebut");
      expect(info).toHaveProperty("imageURL");

      // Test stats properties
      expect(stats).toHaveProperty("record");
      expect(stats).toHaveProperty("winByMethod");
      expect(stats).toHaveProperty("strikingAccuracy");
      expect(stats).toHaveProperty("takedownAccuracy");
      expect(stats).toHaveProperty("striking");
      expect(stats).toHaveProperty("grappling");
      expect(stats).toHaveProperty("metrics");
      expect(stats).toHaveProperty("significantStrikeByPosition");
      expect(stats).toHaveProperty("significantStrikeByTarget");
    });

    test("should throw ValidationError for invalid slug", async () => {
      await expect(getFighter("")).rejects.toThrow(ValidationError);
      await expect(getFighter("invalid slug with spaces")).rejects.toThrow(
        ValidationError
      );
    });

    test("should handle non-existent fighter gracefully", async () => {
      const result = await getFighter("nonexistent-fighter-12345");
      expect(result).toBeDefined();
    }, 30_000);
  });
});
