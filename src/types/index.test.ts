import { describe, it, expect } from "vitest";
import {
  generateId,
  formatDuration,
  formatDate,
  EMOM_DURATIONS,
  PAUSE_DURATIONS,
} from "./index";

describe("types/index", () => {
  describe("generateId", () => {
    it("should generate a valid UUID", () => {
      const id = generateId();
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidRegex);
    });

    it("should generate unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("formatDuration", () => {
    it("should format seconds to mm:ss", () => {
      expect(formatDuration(0)).toBe("0:00");
      expect(formatDuration(30)).toBe("0:30");
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(90)).toBe("1:30");
      expect(formatDuration(125)).toBe("2:05");
      expect(formatDuration(3600)).toBe("60:00");
    });

    it("should pad seconds with leading zero", () => {
      expect(formatDuration(61)).toBe("1:01");
      expect(formatDuration(69)).toBe("1:09");
    });
  });

  describe("formatDate", () => {
    it("should format ISO date to French locale", () => {
      const result = formatDate("2024-03-15T10:30:00.000Z");
      // French format: "15 mars 2024"
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("Constants", () => {
    it("should have correct EMOM durations", () => {
      expect(EMOM_DURATIONS).toEqual([2, 3, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20]);
    });

    it("should have correct pause durations in seconds", () => {
      expect(PAUSE_DURATIONS).toEqual([60, 90, 120, 180, 300]);
    });
  });
});
