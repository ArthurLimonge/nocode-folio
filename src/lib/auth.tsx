import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface ResultadoAuth {
  error: string | null;
  /** true quando a conta foi criada mas ainda precisa confirmar email. */
  precisaConfirmar?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  entrarComSenha: (email: string, senha: string) => Promise<ResultadoAuth>;
  cadastrarComSenha: (email: string, senha: string, nome?: string) => Promise<ResultadoAuth>;
  signInComGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/callback`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async entrarComSenha(email: string, senha: string) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        return { error: error?.message ?? null };
      },
      async cadastrarComSenha(email: string, senha: string, nome?: string) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: nome ? { data: { full_name: nome } } : undefined,
        });
        if (error) return { error: error.message };
        // Sem sessão = confirmação de email ainda ativa no projeto.
        return { error: null, precisaConfirmar: !data.session };
      },
      async signInComGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: getRedirectTo() },
        });
        return { error: error?.message ?? null };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  }
  return ctx;
}
