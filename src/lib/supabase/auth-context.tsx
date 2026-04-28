"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  loading: boolean;
  credits: number;
  plan: string;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const defaultState: AuthContextType = {
  user: null,
  loading: true,
  credits: 0,
  plan: "FREE",
  signUp: async () => ({ error: "Not configured" }),
  signIn: async () => ({ error: "Not configured" }),
  signInWithOAuth: async () => {},
  signOut: async () => {},
  refreshCredits: async () => {},
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState<ReturnType<typeof createClient> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  });

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: Boolean(supabase),
    credits: 0,
    plan: "FREE",
  });

  const fetchUserProfile = useCallback(
    async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setState((prev) => ({
            ...prev,
            credits: data.credits ?? 20,
            plan: data.plan ?? "FREE",
          }));
        }
      } catch {
        // Profile may not exist yet
      }
    },
    []
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setState((prev) => ({ ...prev, user: data.user, loading: false }));
      if (data.user) fetchUserProfile();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      const user = session?.user ?? null;
      setState((prev) => ({ ...prev, user, loading: false }));
      if (user) fetchUserProfile();
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserProfile]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithOAuth = async (provider: "google" | "github") => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("OAuth error:", error.message);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState({ user: null, loading: false, credits: 0, plan: "FREE" });
  };

  const refreshCredits = async () => {
    if (state.user) {
      await fetchUserProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signUp, signIn, signInWithOAuth, signOut, refreshCredits }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultState;
  }
  return context;
}
