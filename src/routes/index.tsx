import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Check, Share2 } from "lucide-react";
import {
  BentoBlock,
  renderWidget,
  type Widget,
} from "@/components/bento";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lucas Mendes — NoCode Folio" },
      {
        name: "description",
        content:
          "Perfil modular de Lucas Mendes no NoCode Folio: projetos, redes sociais e novidades em uma página estilo Bento Grid.",
      },
      { property: "og:title", content: "Lucas Mendes — NoCode Folio" },
      {
        property: "og:description",
        content:
          "Perfil modular estilo Bento Grid com projetos, redes sociais e newsletter.",
      },
    ],
  }),
  component: Index,
});

const initialWidgets: Widget[] = [
  { id: "w-profile", type: "profile", size: "2x2" },
  { id: "w-social-1", type: "socials", size: "1x1" },
  { id: "w-social-2", type: "socials", size: "1x1" },
  { id: "w-showcase", type: "showcase", size: "2x1" },
  { id: "w-map", type: "map", size: "1x1" },
  { id: "w-stat", type: "stat", size: "1x1" },
  { id: "w-newsletter", type: "newsletter", size: "2x1" },
  { id: "w-social-3", type: "socials", size: "1x1" },
  { id: "w-social-4", type: "socials", size: "1x1" },
];

function Index() {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [editing, setEditing] = useState(false);

  const socialCounters = useMemo(() => {
    let n = 0;
    return widgets.map((w) => (w.type === "socials" ? n++ : -1));
  }, [widgets]);

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= widgets.length) return;
    const next = [...widgets];
    [next[from], next[to]] = [next[to], next[from]];
    setWidgets(next);
  };

  const remove = (id: string) => {
    setWidgets((ws) => ws.filter((w) => w.id !== id));
  };

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-32 pt-10 sm:px-6 sm:pt-14 lg:pt-20">
      {/* Top bar */}
      <header className="mb-8 flex items-center justify-between sm:mb-10">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_18px_oklch(0.6_0.24_295/0.6)]">
            <span className="text-sm font-black text-primary-foreground">N</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            NoCode <span className="text-muted-foreground">Folio</span>
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-primary/10"
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar
        </button>
      </header>

      {/* Bento grid */}
      <section
        className="bento-grid"
        aria-label="Perfil em grade Bento"
      >
        {widgets.map((w, i) => (
          <BentoBlock
            key={w.id}
            widget={w}
            index={i}
            total={widgets.length}
            editing={editing}
            onMove={move}
            onDelete={remove}
          >
            {renderWidget(w, socialCounters[i])}
          </BentoBlock>
        ))}
      </section>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Feito com <span className="text-foreground">NoCode Folio</span> · Bento UI
      </p>

      {/* Floating edit FAB */}
      <button
        type="button"
        onClick={() => setEditing((e) => !e)}
        className={
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold shadow-[0_12px_40px_-8px_oklch(0.6_0.24_295/0.6)] transition active:scale-95 " +
          (editing
            ? "bg-foreground text-background"
            : "bg-primary text-primary-foreground hover:bg-primary-glow")
        }
        aria-label={editing ? "Concluir edição" : "Editar perfil"}
      >
        {editing ? (
          <>
            <Check className="h-4 w-4" />
            Concluir
          </>
        ) : (
          <>
            <Pencil className="h-4 w-4" />
            Editar perfil
          </>
        )}
      </button>
    </main>
  );
}
