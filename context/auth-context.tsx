"use client";

import { createClient } from "@/utils/supabase/client";
import { Database } from "@/utils/supabase/types/database.types";
import { AuthSession, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: AuthSession | null;
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  getUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (
    newPassword: string,
    token?: string
  ) => Promise<{ error: Error | null }>;
  getUsernameExists: (
    username: string
  ) => Promise<{ count: number | null; error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<
    Database["public"]["Tables"]["profiles"]["Row"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
      } else {
        setSession(data?.session || null);
        setUser(data?.session?.user || null);

        if (data?.session?.user) {
          await getUserProfile();
        }
      }

      setIsLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setIsLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    return { error };
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (!error) {
      toast.success("Logged in successfully");
    }

    return { error };
  };

  /**
   * Sign in with magic link
   */
  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (!error) {
      toast.success("Check your email for the login link!");
    }

    return { error };
  };

  const getUserProfile = async () => {
    setIsLoading(true);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    setProfile(data);
    setIsLoading(false);
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
    toast.success("Logged out successfully");
  };

  /**
   * Reset password (sends reset email)
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });

    setIsLoading(false);

    if (!error) {
      toast.success("Check your email for the password reset link!");
    }

    return { error };
  };

  /**
   * Update password (after reset)
   */
  const updatePassword = async (newPassword: string, token?: string) => {
    setIsLoading(true);
    let error;

    try {
      if (token) {
        // For password reset flow, use resetPassword API
        const { error: updateError } = await supabase.auth.updateUser(
          {
            password: newPassword,
          },
          {
            emailRedirectTo: `${window.location.origin}/login`,
          }
        );

        error = updateError;
      } else {
        // For regular password update (when user is logged in)
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        error = updateError;
      }
    } catch (err: unknown) {
      error = err as Error;
    }

    setIsLoading(false);
    return { error };
  };

  const getUsernameExists = async (username: string) => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("username", username);

    return { count, error };
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithMagicLink,
    getUserProfile,
    signOut,
    resetPassword,
    updatePassword,
    getUsernameExists,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
