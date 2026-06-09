import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Pencil,
  Instagram,
  Github,
  Linkedin,
  Youtube,
  MapPin,
  ArrowRight,
  Play,
  Sparkles,
  Mail,
} from "lucide-react";
import avatarImg from "@/assets/avatar.jpg";
import coverImg from "@/assets/project-cover.jpg";
import mapImg from "@/assets/map.jpg";

export type WidgetSize = "1x1" | "2x1" | "2x2";

export type Widget =
  | { id: string; type: "profile"; size: WidgetSize }
  | { id: string; type: "socials"; size: WidgetSize }
  | { id: string; type: "showcase"; size: WidgetSize }
  | { id: string; type: "newsletter"; size: WidgetSize }
  | { id: string; type: "map"; size: WidgetSize }
  | { id: string; type: "stat"; size: WidgetSize };

const sizeClass: Record<WidgetSize, string> = {
  "1x1": "sm:col-span-1 sm:row-span-1",
  "2x1": "sm:col-span-2 sm:row-span-1",
  "2x2": "sm:col-span-2 sm:row-span-2",
};

interface BentoBlockProps {
  widget: Widget;
  index: number;
  editing: boolean;
  total: number;
  onMove: (from: number, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export function BentoBlock({
  widget,
  index,
  editing,
  total,
  onMove,
  onDelete,
  children,
}: BentoBlockProps) {
  return (
    <div
      className={cn(
        "glass-card glass-card-hover animate-bento-in relative overflow-hidden",
        sizeClass[widget.size],
        editing && "animate-wiggle",
      )}
      style={{ animationDelay: editing ? "0s" : `${index * 70}ms` }}
    >
      {children}

      {editing && (
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onMove(index, -1)}
              disabled={index === 0}
              className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur border border-white/10 text-foreground disabled:opacity-30 hover:bg-primary/30 transition"
              aria-label="Mover para cima"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMove(index, 1)}
              disabled={index === total - 1}
              className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur border border-white/10 text-foreground disabled:opacity-30 hover:bg-primary/30 transition"
              aria-label="Mover para baixo"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur border border-white/10 text-foreground hover:bg-primary/30 transition"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(widget.id)}
              className="grid h-8 w-8 place-items-center rounded-full bg-background/70 backdrop-blur border border-white/10 text-destructive hover:bg-destructive/30 transition"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Profile (2x2) -------------------- */
export function ProfileWidget() {
  const skills = ["Bubble", "React", "Webflow", "Supabase", "Figma"];
  return (
    <div className="flex h-full flex-col gap-5 p-6 sm:p-7">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-primary to-primary-glow opacity-60 blur-md" />
          <img
            src={avatarImg}
            alt="Lucas Mendes"
            width={96}
            height={96}
            className="relative h-20 w-20 rounded-[1.5rem] object-cover ring-1 ring-white/10"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]" />
          Disponível
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Lucas Mendes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          NoCode Builder & Creative Developer. Construindo produtos que parecem mágica
          — sem escrever (muito) código.
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {skills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Socials (1x1) -------------------- */
const socials = [
  { icon: Instagram, label: "Instagram", href: "#", color: "from-pink-500 to-orange-400" },
  { icon: Github, label: "GitHub", href: "#", color: "from-slate-300 to-slate-500" },
  { icon: Linkedin, label: "LinkedIn", href: "#", color: "from-sky-400 to-blue-600" },
  { icon: Youtube, label: "YouTube", href: "#", color: "from-red-500 to-rose-600" },
];

export function SocialWidget({ idx }: { idx: number }) {
  const s = socials[idx % socials.length];
  const Icon = s.icon;
  return (
    <a
      href={s.href}
      className="group relative grid h-full w-full place-items-center p-6"
      aria-label={s.label}
    >
      <div
        className={cn(
          "absolute inset-6 rounded-2xl bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40",
          s.color,
        )}
      />
      <div className="relative flex flex-col items-center gap-3">
        <Icon className="h-9 w-9 text-foreground transition-transform duration-300 group-hover:scale-110" />
        <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
      </div>
    </a>
  );
}

/* -------------------- Content Showcase (2x1) -------------------- */
export function ShowcaseWidget() {
  return (
    <div className="relative h-full w-full">
      <img
        src={coverImg}
        alt="Projeto em destaque"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground ring-1 ring-primary/40">
            <Play className="h-3 w-3" /> Em destaque
          </span>
          <span className="text-xs text-muted-foreground">Case 2026</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground sm:text-xl">
              Bento OS — Sistema modular para criadores
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              Construído em Bubble + Supabase em 14 dias.
            </p>
          </div>
          <button className="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-4px_oklch(0.6_0.24_295/0.6)] transition hover:scale-105">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Newsletter (2x1) -------------------- */
export function NewsletterWidget() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6 sm:p-7">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Newsletter
      </div>
      <h3 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
        Receba bastidores de produtos NoCode toda sexta.
      </h3>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="group/form relative flex items-center rounded-full border border-white/10 bg-background/40 p-1.5 backdrop-blur focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_oklch(0.6_0.24_295/0.15)] transition"
      >
        <Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="email"
          required
          placeholder="seu@email.com"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow"
        >
          Assinar
        </button>
      </form>
    </div>
  );
}

/* -------------------- Map (1x1) -------------------- */
export function MapWidget() {
  return (
    <div className="relative h-full w-full">
      <img
        src={mapImg}
        alt="Mapa estilizado"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
      {/* Pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-primary/40" />
        <div className="relative grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.6_0.24_295/0.8)]">
          <MapPin className="h-4 w-4" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Baseado em
        </p>
        <p className="text-base font-bold text-foreground">São Paulo, BR</p>
      </div>
    </div>
  );
}

/* -------------------- Stat (1x1) -------------------- */
export function StatWidget() {
  return (
    <div className="flex h-full flex-col justify-between p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Projetos
      </div>
      <div>
        <p className="text-5xl font-extrabold tracking-tight text-foreground">42</p>
        <p className="mt-1 text-sm text-muted-foreground">
          entregues em <span className="text-foreground">2025</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------- Renderer -------------------- */
export function renderWidget(w: Widget, socialIdx: number) {
  switch (w.type) {
    case "profile":
      return <ProfileWidget />;
    case "socials":
      return <SocialWidget idx={socialIdx} />;
    case "showcase":
      return <ShowcaseWidget />;
    case "newsletter":
      return <NewsletterWidget />;
    case "map":
      return <MapWidget />;
    case "stat":
      return <StatWidget />;
  }
}

export { useState };
