import { beforeAll, describe, expect, test } from "bun:test";
import { ValidationError } from "../src/errors/index.js";
import { getPastEvents, getUpcomingEvents } from "../src/scrapers/events.js";
import type { EventList } from "../src/types/events.js";

describe("Events Scraper", () => {
  let upcomingEvents: EventList;
  let pastEvents: EventList;

  beforeAll(async () => {
    upcomingEvents = await getUpcomingEvents();
    pastEvents = await getPastEvents(0);
  });

  describe("getUpcomingEvents", () => {
    test("should successfully fetch upcoming events", () => {
      expect(upcomingEvents).toBeDefined();
      expect(Array.isArray(upcomingEvents)).toBe(true);

      if (upcomingEvents.length > 0) {
        const event = upcomingEvents[0];

        expect(event).toHaveProperty("event");
        expect(event).toHaveProperty("mainCard");
        expect(event).toHaveProperty("prelim");
        expect(event).toHaveProperty("location");
      }
    });
  });

  describe("getPastEvents", () => {
    test("should successfully fetch past events", () => {
      expect(pastEvents).toBeDefined();
      expect(Array.isArray(pastEvents)).toBe(true);

      if (pastEvents.length > 0) {
        const event = pastEvents[0];

        expect(event).toHaveProperty("event");
        expect(event).toHaveProperty("mainCard");
        expect(event).toHaveProperty("prelim");
        expect(event).toHaveProperty("location");
      }
    });

    test("should throw ValidationError for invalid page number", async () => {
      await expect(getPastEvents(-1)).rejects.toThrow(ValidationError);
    });
  });
});
