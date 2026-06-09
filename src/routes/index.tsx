import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Sparkles, LayoutGrid } from "lucide-react";
import { BentoBlock, renderWidget, type Widget } from "@/components/bento";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoCode Folio — Sua página modular estilo Bento" },
      {
        name: "description",
        content:
          "Crie uma página pessoal estilo link-in-bio em grade Bento. Links, textos, imagens, mapas e vídeos — tudo modular, no modo escuro.",
      },
    ],
  }),
  component: Landing,
});

const demoWidgets: Widget[] = [
  { id: "w-profile", type: "profile", size: "2x2" },
  { id: "w-social-1", type: "socials", size: "1x1" },
  { id: "w-social-2", type: "socials", size: "1x1" },
  { id: "w-showcase", type: "showcase", size: "2x1" },
  { id: "w-map", type: "map", size: "1x1" },
  { id: "w-stat", type: "stat", size: "1x1" },
];

function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_18px_oklch(0.6_0.24_295/0.6)]">
            <span className="text-sm font-black text-primary-foreground">N</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            NoCode <span className="text-muted-foreground">Folio</span>
          </span>
        </div>
        {!loading &&
          (user ? (
            <button
              type="button"
              onClick={() => router.navigate({ to: "/auth/callback" })}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Acessar meu Folio <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/10"
            >
              Entrar
            </Link>
          ))}
      </header>

      <section className="mx-auto mb-16 max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Link-in-bio modular
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
          Sua página pessoal em{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            grade Bento
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Reúna links, textos, imagens, mapas e vídeos em blocos modulares. Crie, edite e reordene
          tudo com um visual dark/neon.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <LayoutGrid className="h-4 w-4" />
            Criar meu Folio
          </Link>
        </div>
      </section>

      <section
        className="bento-grid pointer-events-none select-none opacity-95"
        aria-label="Demonstração de grade Bento"
      >
        {demoWidgets.map((w, i) => (
          <BentoBlock
            key={w.id}
            widget={w}
            index={i}
            total={demoWidgets.length}
            editing={false}
            onMove={() => {}}
            onDelete={() => {}}
          >
            {renderWidget(w, i)}
          </BentoBlock>
        ))}
      </section>
    </main>
  );
}
