"use client";

// ============================================
// Store d'authentification (Zustand + Supabase)
// ============================================

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean; success?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    const supabase = createClient();

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    set({
      user: session?.user ?? null,
      session,
      isInitialized: true,
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session,
      });
    });
  },

  signInWithEmail: async (email, password) => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ isLoading: false });

    if (error) {
      console.error("Email sign in error:", error);
      return { error: error.message };
    }

    set({
      user: data.user,
      session: data.session,
    });

    return {};
  },

  signUpWithEmail: async (email, password) => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    set({ isLoading: false });

    if (error) {
      console.error("Email sign up error:", error);
      return { error: error.message };
    }

    // Si confirmation email requise
    if (data.user && !data.session) {
      return { needsEmailConfirmation: true };
    }

    set({
      user: data.user,
      session: data.session,
    });

    return { success: true };
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Apple sign in error:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
    }

    set({
      user: null,
      session: null,
      isLoading: false,
    });
  },
    }),
    { name: "AuthStore", enabled: process.env.NODE_ENV === "development" }
  )
);
