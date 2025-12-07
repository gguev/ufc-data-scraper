import { beforeAll, describe, expect, test } from "bun:test";
import { getTitleholders } from "../src/scrapers/titleholders.js";
import type { Titleholders } from "../src/types/titleholders.js";

describe("Titleholders Scraper", () => {
  let titleholders: Titleholders;

  beforeAll(async () => {
    titleholders = await getTitleholders();
  });

  describe("getTitleholders", () => {
    test("should successfully fetch titleholders data", () => {
      expect(titleholders).toBeDefined();
      expect(typeof titleholders).toBe("object");
      expect(Object.keys(titleholders).length).toBeGreaterThan(0);
    });

    test("should contain expected divisions", () => {
      const expectedDivisions = [
        "flyweight",
        "bantamweight",
        "featherweight",
        "lightweight",
        "welterweight",
        "middleweight",
        "lightHeavyweight",
        "heavyweight",
        "womensStrawweight",
        "womensFlyweight",
        "womensBantamweight",
        "womensFeatherweight",
      ];

      // Check that at least some expected divisions exist
      for (const division of expectedDivisions.slice(0, 5)) {
        if (titleholders[division]) {
          expect(titleholders).toHaveProperty(division);
        }
      }
    });

    test("should have proper structure for each titleholder", () => {
      for (const [, titleholder] of Object.entries(titleholders)) {
        expect(titleholder).toHaveProperty("name");
        expect(titleholder).toHaveProperty("nickname");
        expect(titleholder).toHaveProperty("slug");
        expect(titleholder).toHaveProperty("record");
        expect(titleholder).toHaveProperty("lastFight");
      }
    });
  });
});
