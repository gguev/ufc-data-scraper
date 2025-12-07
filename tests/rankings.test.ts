import { beforeAll, describe, expect, test } from "bun:test";
import { getRankings } from "../src/scrapers/rankings.js";
import type { Rankings } from "../src/types/rankings.js";

describe("Rankings Scraper", () => {
  let rankings: Rankings;

  beforeAll(async () => {
    rankings = await getRankings();
  });

  describe("getRankings", () => {
    test("should successfully fetch rankings data", () => {
      expect(rankings).toBeDefined();
      expect(typeof rankings).toBe("object");
      expect(Object.keys(rankings).length).toBeGreaterThan(0);
    });

    test("should contain expected divisions", () => {
      const expectedDivisions = [
        "mensPoundForPound",
        "womensPoundForPound",
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
      ];

      for (const division of expectedDivisions) {
        expect(rankings).toHaveProperty(division);
      }
    });

    test("should have proper structure for each division", () => {
      for (const [, divisionRanking] of Object.entries(rankings)) {
        expect(Array.isArray(divisionRanking)).toBe(true);

        if (divisionRanking.length > 0) {
          const fighter = divisionRanking[0];

          expect(fighter).toHaveProperty("rank");
          expect(fighter).toHaveProperty("name");
          expect(fighter).toHaveProperty("slug");
        }
      }
    });
  });
});
