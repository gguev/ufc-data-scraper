import { beforeAll, describe, expect, test } from "bun:test";
import { ValidationError } from "../src/errors/index.js";
import { getFighterRecord } from "../src/scrapers/fighter-record.js";
import type { FighterRecordList } from "../src/types/fighter-record.js";

describe("Fighter Record Scraper", () => {
  const validFighterSlug = "jon-jones";
  let fighterRecord: FighterRecordList;

  beforeAll(async () => {
    fighterRecord = await getFighterRecord(validFighterSlug);
  });

  describe("getFighterRecord", () => {
    test("should successfully fetch fighter record for a valid slug", () => {
      expect(fighterRecord).toBeDefined();
      expect(Array.isArray(fighterRecord)).toBe(true);
      expect(fighterRecord.length).toBeGreaterThan(0);

      const firstFight = fighterRecord[0];
      expect(firstFight).toHaveProperty("fightId");
      expect(firstFight).toHaveProperty("event");
      expect(firstFight).toHaveProperty("red");
      expect(firstFight).toHaveProperty("blue");
      expect(firstFight).toHaveProperty("result");
    });

    test("should throw ValidationError for invalid slug", async () => {
      await expect(getFighterRecord("")).rejects.toThrow(ValidationError);
      await expect(
        getFighterRecord("invalid slug with spaces")
      ).rejects.toThrow(ValidationError);
    });

    test("should throw ValidationError for invalid page number", async () => {
      await expect(getFighterRecord(validFighterSlug, -1)).rejects.toThrow(
        ValidationError
      );
      await expect(
        getFighterRecord(validFighterSlug, Number.NaN)
      ).rejects.toThrow(ValidationError);
    });

    test("should return empty array for non-existent fighter", async () => {
      const result = await getFighterRecord("nonexistent-fighter-12345");
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    }, 30_000);
  });
});
