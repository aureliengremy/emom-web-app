// ============================================
// Schémas de validation Zod
// ============================================

import { z } from "zod";

// === Messages d'erreur en français ===

const messages = {
  required: "Ce champ est requis",
  email: "Email invalide",
  passwordMin: "Le mot de passe doit faire au moins 6 caractères",
  passwordMatch: "Les mots de passe ne correspondent pas",
  nameMin: "Le nom doit faire au moins 2 caractères",
  nameMax: "Le nom ne doit pas dépasser 100 caractères",
  descriptionMax: "La description ne doit pas dépasser 500 caractères",
  numberMin: "La valeur doit être positive",
  numberInt: "La valeur doit être un nombre entier",
  atLeastOneExercise: "Ajoute au moins un exercice",
};

// === Auth ===

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, messages.required)
    .email(messages.email),
  password: z
    .string()
    .min(1, messages.required)
    .min(6, messages.passwordMin),
});

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, messages.required)
      .email(messages.email),
    password: z
      .string()
      .min(1, messages.required)
      .min(6, messages.passwordMin),
    confirmPassword: z
      .string()
      .min(1, messages.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordMatch,
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// === Exercise ===

export const exerciseSchema = z.object({
  name: z
    .string()
    .min(1, messages.required)
    .min(2, messages.nameMin)
    .max(100, messages.nameMax),
  category: z.enum(["push", "pull", "legs", "core"]),
  currentMax: z
    .number()
    .int(messages.numberInt)
    .min(0, messages.numberMin),
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;

// === Session ===

export const sessionSetSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  reps: z
    .number()
    .int(messages.numberInt)
    .min(1, "Au moins 1 rep"),
  duration: z
    .number()
    .int(messages.numberInt)
    .min(1, "Au moins 1 minute"),
  weighted: z.boolean().optional(),
  weight: z
    .number()
    .min(0, messages.numberMin)
    .optional(),
});

export const sessionSchema = z.object({
  name: z
    .string()
    .min(1, messages.required)
    .min(2, messages.nameMin)
    .max(100, messages.nameMax),
  description: z
    .string()
    .max(500, messages.descriptionMax),
  sets: z
    .array(sessionSetSchema)
    .min(1, messages.atLeastOneExercise),
});

export type SessionFormData = z.infer<typeof sessionSchema>;
export type SessionSetFormData = z.infer<typeof sessionSetSchema>;

// === Workout Feedback ===

export const workoutRatingSchema = z.enum(["easy", "medium", "hard"]).optional();

export const setFeedbackSchema = z.object({
  rating: workoutRatingSchema,
  comment: z
    .string()
    .max(500, messages.descriptionMax)
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export const workoutFeedbackSchema = z.object({
  rating: workoutRatingSchema,
  notes: z
    .string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export type SetFeedbackFormData = z.infer<typeof setFeedbackSchema>;
export type WorkoutFeedbackFormData = z.infer<typeof workoutFeedbackSchema>;

// === Helper pour extraire les erreurs ===

export function getFieldError(
  errors: Record<string, { message?: string } | undefined>,
  field: string
): string | undefined {
  return errors[field]?.message;
}
