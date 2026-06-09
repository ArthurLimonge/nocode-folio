import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar — NoCode Folio" }],
  }),
  component: LoginPage,
});

type Modo = "entrar" | "criar";

function LoginPage() {
  const { entrarComSenha, cadastrarComSenha, session, loading } = useAuth();
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.navigate({ to: "/auth/callback" });
    }
  }, [loading, session, router]);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;
    if (modo === "criar" && senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    const resultado =
      modo === "entrar"
        ? await entrarComSenha(email, senha)
        : await cadastrarComSenha(email, senha, nome.trim() || undefined);
    setEnviando(false);

    if (resultado.error) {
      toast.error(traduzErro(resultado.error));
      return;
    }
    if (modo === "criar" && resultado.precisaConfirmar) {
      toast.message("Conta criada! Confirme o email para entrar.", {
        description:
          "A confirmação por email está ativa no projeto. Desative-a no Supabase para entrar direto.",
      });
      setModo("entrar");
      return;
    }
    router.navigate({ to: "/auth/callback" });
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_18px_oklch(0.6_0.24_295/0.6)]">
            <span className="text-sm font-black text-primary-foreground">N</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            NoCode <span className="text-muted-foreground">Folio</span>
          </span>
        </div>

        <div className="glass-card p-7 sm:p-8">
          {/* Alternância Entrar / Criar conta */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {(["entrar", "criar"] as Modo[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={cn(
                  "rounded-full py-2 text-sm font-medium transition",
                  modo === m
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {modo === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {modo === "entrar"
                ? "Entre com seu email e senha."
                : "Cadastre-se com email e senha para começar."}
            </p>
          </div>

          <form onSubmit={submeter} className="space-y-3">
            {modo === "criar" && (
              <div className="flex items-center rounded-full border border-white/10 bg-background/40 p-1.5 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_oklch(0.6_0.24_295/0.15)] transition">
                <User className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
              </div>
            )}
            <div className="flex items-center rounded-full border border-white/10 bg-background/40 p-1.5 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_oklch(0.6_0.24_295/0.15)] transition">
              <Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </div>
            <div className="flex items-center rounded-full border border-white/10 bg-background/40 p-1.5 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_oklch(0.6_0.24_295/0.15)] transition">
              <Lock className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha (mín. 6 caracteres)"
                className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {modo === "entrar" ? "Entrar" : "Criar conta"} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) {
    return "Email ou senha incorretos.";
  }
  if (/user already registered/i.test(msg)) {
    return "Este email já está cadastrado. Faça login.";
  }
  if (/password should be at least/i.test(msg)) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }
  return msg;
}
