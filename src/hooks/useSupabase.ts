import { SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export const SupabaseContext = createContext<{
  supabase: SupabaseClient;
} | null>(null);

export const useSupabase = () => {
  const supabaseClient = useContext(SupabaseContext);
  if (!supabaseClient) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return supabaseClient;
};
