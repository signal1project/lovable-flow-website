import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";
import { createProfile } from "@/utils/profileOperations";
import { SupabaseClient } from '@supabase/supabase-js';

const allowedRoles = ["lender", "broker", "admin"] as const;
type Role = (typeof allowedRoles)[number];

export const useAuthOperations = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { full_name: string; role: string; country: string }
  ) => {
    const role = userData.role.toLowerCase();

    if (!allowedRoles.includes(role as Role)) {
      return { error: { message: `Invalid role: ${userData.role}` }, user: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role,
          country: userData.country,
        },
      },
    });

    return { error, user: data?.user ?? null };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during signOut:", error);
    }
  };

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
