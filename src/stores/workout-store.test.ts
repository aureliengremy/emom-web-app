import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWorkoutStore } from "./workout-store";
import type { SessionPlan, PlannedSet, WorkoutRating } from "@/types";

// Mock auth store
vi.mock("./auth-store", () => ({
  useAuthStore: {
    getState: () => ({ user: null }),
  },
}));

// Mock IndexedDB
vi.mock("@/lib/db", () => ({
  getWorkouts: vi.fn().mockResolvedValue([]),
  saveWorkout: vi.fn().mockResolvedValue(undefined),
  deleteWorkout: vi.fn().mockResolvedValue(undefined),
}));

// Mock Supabase
vi.mock("@/lib/supabase/data-service", () => ({
  getSupabaseWorkouts: vi.fn().mockResolvedValue([]),
  saveSupabaseWorkout: vi.fn().mockResolvedValue(undefined),
  deleteSupabaseWorkout: vi.fn().mockResolvedValue(undefined),
}));

describe("workout-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useWorkoutStore.setState({
      workoutHistory: [],
      isLoaded: false,
      currentWorkout: null,
      sessionPlan: null,
      timer: {
        status: "idle",
        secondsRemaining: 60,
        currentMinute: 1,
        totalMinutes: 10,
        currentSetIndex: 0,
        totalSets: 1,
        isPausingBetweenSets: false,
        pauseSecondsRemaining: 0,
        countdownSeconds: 10,
      },
    });
  });

  describe("startWorkout", () => {
    it("should create a workout from session plan", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).not.toBeNull();
      expect(state.currentWorkout?.sets.length).toBe(1);
      expect(state.currentWorkout?.sets[0].exerciseName).toBe("Tractions");
      expect(state.timer.status).toBe("countdown");
      expect(state.timer.countdownSeconds).toBe(10);
    });

    it("should create correct workout minutes for each set", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pushups",
            exerciseName: "Pompes",
            reps: 10,
            duration: 5, // 5 minutes
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout?.sets[0].minutes.length).toBe(5);
      state.currentWorkout?.sets[0].minutes.forEach((minute, idx) => {
        expect(minute.minuteNumber).toBe(idx + 1);
        expect(minute.targetReps).toBe(10);
        expect(minute.status).toBe("pending");
      });
    });
  });

  describe("updateSetFeedback", () => {
    it("should update feedback for a specific set", () => {
      const store = useWorkoutStore.getState();

      // First start a workout
      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
          {
            id: "set-2",
            exerciseId: "dips",
            exerciseName: "Dips",
            reps: 8,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      // Update feedback for first set
      store.updateSetFeedback("set-1", {
        rating: "hard" as WorkoutRating,
        comment: "Très difficile aujourd'hui",
      });

      const state = useWorkoutStore.getState();
      const set1 = state.currentWorkout?.sets.find((s) => s.id === "set-1");
      const set2 = state.currentWorkout?.sets.find((s) => s.id === "set-2");

      expect(set1?.feedback?.rating).toBe("hard");
      expect(set1?.feedback?.comment).toBe("Très difficile aujourd'hui");
      expect(set2?.feedback).toBeUndefined();
    });
  });

  describe("cancelWorkout", () => {
    it("should reset all workout state", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);
      expect(useWorkoutStore.getState().currentWorkout).not.toBeNull();

      store.cancelWorkout();

      const state = useWorkoutStore.getState();
      expect(state.currentWorkout).toBeNull();
      expect(state.sessionPlan).toBeNull();
      expect(state.timer.status).toBe("idle");
    });
  });

  describe("timer controls", () => {
    it("should pause and resume timer", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      // Simulate countdown complete
      useWorkoutStore.setState((state) => ({
        timer: { ...state.timer, status: "running" },
      }));

      store.pauseTimer();
      expect(useWorkoutStore.getState().timer.status).toBe("paused");

      store.resumeTimer();
      expect(useWorkoutStore.getState().timer.status).toBe("running");
    });
  });

  describe("tick", () => {
    it("should decrement countdown seconds during countdown phase", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);
      expect(useWorkoutStore.getState().timer.countdownSeconds).toBe(10);

      store.tick();
      expect(useWorkoutStore.getState().timer.countdownSeconds).toBe(9);

      store.tick();
      expect(useWorkoutStore.getState().timer.countdownSeconds).toBe(8);
    });

    it("should transition to running after countdown", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      // Set countdown to 1
      useWorkoutStore.setState((state) => ({
        timer: { ...state.timer, countdownSeconds: 1 },
      }));

      const result = store.tick();

      expect(result.countdownComplete).toBe(true);
      expect(useWorkoutStore.getState().timer.status).toBe("running");
    });
  });

  describe("getters", () => {
    it("getCurrentSet should return current set", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
          {
            id: "set-2",
            exerciseId: "dips",
            exerciseName: "Dips",
            reps: 8,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      const currentSet = store.getCurrentSet();
      expect(currentSet?.exerciseName).toBe("Tractions");
    });

    it("getCurrentPlannedSet should return current planned set", () => {
      const store = useWorkoutStore.getState();

      const plan: SessionPlan = {
        sets: [
          {
            id: "set-1",
            exerciseId: "pullups",
            exerciseName: "Tractions",
            reps: 5,
            duration: 10,
          },
        ],
        pauseDuration: 60,
      };

      store.startWorkout(plan);

      const plannedSet = store.getCurrentPlannedSet();
      expect(plannedSet?.reps).toBe(5);
      expect(plannedSet?.duration).toBe(10);
    });
  });
});
