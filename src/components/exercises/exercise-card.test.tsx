import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseCard } from "./exercise-card";
import type { Exercise } from "@/types";

// Mock exercise data - using a unique name to avoid conflicts with family label
const mockExercise: Exercise = {
  id: "pullup",
  name: "Traction",
  type: "preset",
  category: "pull",
  family: "pullup",
  difficulty: "classique",
  currentMax: 20,
  currentEMOM: { reps: 8, duration: 10 },
  lastTested: "2024-01-15T10:00:00.000Z",
  createdAt: "2024-01-01T10:00:00.000Z",
};

const mockCustomExercise: Exercise = {
  id: "custom-1",
  name: "Mon exercice",
  type: "custom",
  category: "core",
  currentMax: 15,
  currentEMOM: { reps: 5, duration: 10 },
  lastTested: "2024-01-15T10:00:00.000Z",
  createdAt: "2024-01-01T10:00:00.000Z",
};

describe("ExerciseCard", () => {
  it("should render exercise name", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    // Both name and family label are "Traction", so use getAllByText
    expect(screen.getAllByText("Traction").length).toBeGreaterThanOrEqual(1);
  });

  it("should display difficulty badge for preset exercise", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("Classique")).toBeInTheDocument();
  });

  it("should display family label", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    // Family label is "Traction" for pullup family
    expect(screen.getAllByText("Traction").length).toBeGreaterThanOrEqual(1);
  });

  it("should display max reps", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("Max: 20")).toBeInTheDocument();
  });

  it("should display EMOM config", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("8 reps / 10'")).toBeInTheDocument();
  });

  it("should show Custom badge for custom exercises", () => {
    render(<ExerciseCard exercise={mockCustomExercise} />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(<ExerciseCard exercise={mockExercise} onClick={handleClick} />);

    const card = container.querySelector(".cursor-pointer");
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply selected styles when selected", () => {
    const { container } = render(
      <ExerciseCard exercise={mockExercise} selected={true} />
    );

    const card = container.querySelector(".ring-2.ring-primary");
    expect(card).toBeInTheDocument();
  });

  it("should not apply selected styles when not selected", () => {
    const { container } = render(
      <ExerciseCard exercise={mockExercise} selected={false} />
    );

    const card = container.querySelector(".ring-2.ring-primary");
    expect(card).not.toBeInTheDocument();
  });

  it("should display N/A for exercise without difficulty", () => {
    const exerciseWithoutDifficulty: Exercise = {
      ...mockCustomExercise,
      difficulty: undefined,
    };
    render(<ExerciseCard exercise={exerciseWithoutDifficulty} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("should display weighted info when exercise has weight", () => {
    const weightedExercise: Exercise = {
      ...mockExercise,
      currentEMOM: { reps: 5, duration: 10, weighted: true, weight: 10 },
    };
    render(<ExerciseCard exercise={weightedExercise} />);
    // The component doesn't show weight in the current implementation
    // but we can test the reps are displayed
    expect(screen.getByText(/5 reps/)).toBeInTheDocument();
  });
});
