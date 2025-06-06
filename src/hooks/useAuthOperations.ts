import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/types/auth";
import { createProfile } from "@/utils/profileOperations";

const allowedRoles = ["lender", "broker", "admin"] as const;
type Role = (typeof allowedRoles)[number];

export const useAuthOperations = () => {
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
      }

      return { error };
    } catch (error) {
      console.error("💥 Sign in exception:", error);
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
      return { error: { message: `Invalid role: ${userData.role}` } };
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

    return { error };
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session before signOut:", session);
      if (!session) {
        console.warn("No active session found.");
        return;
      }
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
