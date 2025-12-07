import { describe, expect, test } from "bun:test";
import { ValidationError } from "../src/errors/index.js";
import { getFighters } from "../src/scrapers/fighters.js";

describe("Fighters Scraper", () => {
  describe("getFighters", () => {
    test("should successfully fetch fighters list", async () => {
      const fightersPage0 = await getFighters(0);

      expect(fightersPage0).toBeDefined();
      expect(Array.isArray(fightersPage0)).toBe(true);

      if (fightersPage0.length > 0) {
        const fighter = fightersPage0[0];

        expect(fighter).toHaveProperty("name");
        expect(fighter).toHaveProperty("nickname");
        expect(fighter).toHaveProperty("division");
        expect(fighter).toHaveProperty("record");
        expect(fighter).toHaveProperty("slug");
      }
    }, 30_000);

    test("should throw ValidationError for invalid page number", async () => {
      await expect(getFighters(-1)).rejects.toThrow(ValidationError);
    });

    test("should handle empty page gracefully", async () => {
      // Test with a high page number that might return no results
      const highPageFighters = await getFighters(999);
      expect(Array.isArray(highPageFighters)).toBe(true);
    }, 30_000);
  });
});
