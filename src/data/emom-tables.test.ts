import { describe, it, expect } from "vitest";
import {
  calculateRecommendedEMOM,
  calculateGenericEMOM,
  getExerciseLevel,
  getDifficultyColor,
  getDifficultyLabel,
  getFamilyLabel,
  getExercisesByFamily,
  PRESET_EXERCISES,
  PULLUPS_RANGES,
  DIPS_RANGES,
  PUSHUPS_RANGES,
  MUSCLEUPS_RANGES,
} from "./emom-tables";

describe("emom-tables", () => {
  describe("PRESET_EXERCISES", () => {
    it("should have 41 preset exercises", () => {
      expect(PRESET_EXERCISES.length).toBe(41);
    });

    it("should have all required fields for each exercise", () => {
      PRESET_EXERCISES.forEach((exercise) => {
        expect(exercise).toHaveProperty("id");
        expect(exercise).toHaveProperty("nameFr");
        expect(exercise).toHaveProperty("nameEn");
        expect(exercise).toHaveProperty("category");
        expect(exercise).toHaveProperty("family");
        expect(exercise).toHaveProperty("difficulty");
        expect(exercise).toHaveProperty("defaultMax");
      });
    });

    it("should have valid categories", () => {
      const validCategories = ["push", "pull", "legs", "core"];
      PRESET_EXERCISES.forEach((exercise) => {
        expect(validCategories).toContain(exercise.category);
      });
    });

    it("should have valid difficulties", () => {
      const validDifficulties = ["novice", "classique", "intermediaire", "avance", "expert"];
      PRESET_EXERCISES.forEach((exercise) => {
        expect(validDifficulties).toContain(exercise.difficulty);
      });
    });

    it("should have unique IDs", () => {
      const ids = PRESET_EXERCISES.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("calculateRecommendedEMOM", () => {
    it("should return correct EMOM for pullups based on max", () => {
      // Max 0-5 -> 2 reps
      expect(calculateRecommendedEMOM("pullups", 3)).toEqual({ reps: 2, duration: 10 });

      // Max 5-10 -> 3 reps
      expect(calculateRecommendedEMOM("pullups", 7)).toEqual({ reps: 3, duration: 10 });

      // Max 10-15 -> 4 reps
      expect(calculateRecommendedEMOM("pullups", 12)).toEqual({ reps: 4, duration: 10 });
    });

    it("should return weighted EMOM for high max pullups", () => {
      const result = calculateRecommendedEMOM("pullups", 40);
      expect(result.weighted).toBe(true);
      expect(result.weight).toBe(10);
    });

    it("should use generic calculation for unknown exercises", () => {
      const result = calculateRecommendedEMOM("unknown-exercise", 20);
      expect(result.reps).toBe(7); // 35% of 20 = 7
      expect(result.duration).toBe(10);
    });
  });

  describe("calculateGenericEMOM", () => {
    it("should calculate 35% of max, minimum 1 rep", () => {
      expect(calculateGenericEMOM(20)).toEqual({ reps: 7, duration: 10 });
      expect(calculateGenericEMOM(10)).toEqual({ reps: 4, duration: 10 }); // 3.5 rounded to 4
      expect(calculateGenericEMOM(1)).toEqual({ reps: 1, duration: 10 }); // minimum 1
      expect(calculateGenericEMOM(0)).toEqual({ reps: 1, duration: 10 }); // minimum 1
    });
  });

  describe("getExerciseLevel", () => {
    it("should return correct level for pullups", () => {
      expect(getExerciseLevel("pullups", 3)).toBe("beginner");
      expect(getExerciseLevel("pullups", 12)).toBe("intermediate");
      expect(getExerciseLevel("pullups", 25)).toBe("advanced");
      expect(getExerciseLevel("pullups", 40)).toBe("master"); // 40+ is master level
    });

    it("should return generic level for unknown exercises", () => {
      expect(getExerciseLevel("unknown", 5)).toBe("beginner");
      expect(getExerciseLevel("unknown", 15)).toBe("intermediate");
      expect(getExerciseLevel("unknown", 30)).toBe("advanced");
      expect(getExerciseLevel("unknown", 50)).toBe("expert");
      expect(getExerciseLevel("unknown", 70)).toBe("master");
    });
  });

  describe("getDifficultyColor", () => {
    it("should return correct colors for each difficulty", () => {
      expect(getDifficultyColor("novice")).toBe("bg-green-500");
      expect(getDifficultyColor("classique")).toBe("bg-blue-500");
      expect(getDifficultyColor("intermediaire")).toBe("bg-purple-500");
      expect(getDifficultyColor("avance")).toBe("bg-orange-500");
      expect(getDifficultyColor("expert")).toBe("bg-red-500");
    });
  });

  describe("getDifficultyLabel", () => {
    it("should return French labels for each difficulty", () => {
      expect(getDifficultyLabel("novice")).toBe("Novice");
      expect(getDifficultyLabel("classique")).toBe("Classique");
      expect(getDifficultyLabel("intermediaire")).toBe("Intermédiaire");
      expect(getDifficultyLabel("avance")).toBe("Avancé");
      expect(getDifficultyLabel("expert")).toBe("Expert");
    });
  });

  describe("getFamilyLabel", () => {
    it("should return French labels for each family", () => {
      expect(getFamilyLabel("pushup", "fr")).toBe("Pompe");
      expect(getFamilyLabel("pullup", "fr")).toBe("Traction");
      expect(getFamilyLabel("squat", "fr")).toBe("Squat");
      expect(getFamilyLabel("core", "fr")).toBe("Core");
      expect(getFamilyLabel("custom", "fr")).toBe("Personnalisé");
    });

    it("should return English labels for each family", () => {
      expect(getFamilyLabel("pushup", "en")).toBe("Push-up");
      expect(getFamilyLabel("pullup", "en")).toBe("Pull-up");
      expect(getFamilyLabel("squat", "en")).toBe("Squat");
      expect(getFamilyLabel("core", "en")).toBe("Core");
      expect(getFamilyLabel("custom", "en")).toBe("Custom");
    });

    it("should default to French labels", () => {
      expect(getFamilyLabel("pushup")).toBe("Pompe");
    });
  });

  describe("getExercisesByFamily", () => {
    it("should return all exercises for a given family", () => {
      const pushupExercises = getExercisesByFamily("pushup");
      expect(pushupExercises.length).toBe(5);
      pushupExercises.forEach((e) => {
        expect(e.family).toBe("pushup");
      });
    });

    it("should return exercises sorted by difficulty within family", () => {
      const squatExercises = getExercisesByFamily("squat");
      expect(squatExercises.length).toBe(5);
      expect(squatExercises[0].difficulty).toBe("novice");
      expect(squatExercises[4].difficulty).toBe("expert");
    });
  });

  describe("EMOM Ranges", () => {
    it("should have valid pullup ranges", () => {
      expect(PULLUPS_RANGES.length).toBeGreaterThan(0);
      PULLUPS_RANGES.forEach((range) => {
        expect(range.minMax).toBeDefined();
        expect(range.maxMax).toBeDefined();
        expect(range.recommended.reps).toBeGreaterThan(0);
        expect(range.recommended.duration).toBe(10);
      });
    });

    it("should have valid dips ranges", () => {
      expect(DIPS_RANGES.length).toBeGreaterThan(0);
    });

    it("should have valid pushups ranges", () => {
      expect(PUSHUPS_RANGES.length).toBeGreaterThan(0);
    });

    it("should have valid muscleups ranges", () => {
      expect(MUSCLEUPS_RANGES.length).toBeGreaterThan(0);
    });
  });
});
