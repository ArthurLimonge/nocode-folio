import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!rawUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Configure-as em .env.local.",
  );
}

// O supabase-js espera a URL base do projeto (sem /rest/v1 ou barra final);
// caso contrário, endpoints como /auth/v1/otp ficam errados (404).
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});
