import { useState } from "react";
import { ArrowUpRight, Copy, Check, MapPin, ImageOff, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  lerConteudo,
  type Bloco,
  type ConteudoImagem,
  type ConteudoLink,
  type ConteudoMapa,
  type ConteudoTexto,
  type ConteudoVideo,
  type TipoBloco,
} from "@/lib/types";

/* -------------------- Tamanho na grid -------------------- */
const colSpan: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "lg:col-span-3 sm:col-span-2",
  4: "lg:col-span-4 sm:col-span-2",
};

const rowSpan: Record<number, string> = {
  1: "row-span-1",
  2: "sm:row-span-2",
};

export function classesGrid(colunas: number, linhas: number) {
  return cn(colSpan[colunas] ?? colSpan[1], rowSpan[linhas] ?? rowSpan[1]);
}

/* -------------------- YouTube helper -------------------- */
function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.pathname.includes("/embed/")) return url;
    return null;
  } catch {
    return null;
  }
}

/* -------------------- Renderizadores -------------------- */
function BlocoLink({ bloco }: { bloco: Bloco }) {
  const c = lerConteudo<ConteudoLink>(bloco);
  if (!c.url) return <BlocoVazio rotulo="Link sem URL" />;
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full w-full flex-col justify-between gap-4 p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-foreground">
          <LinkIcon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <div>
        {bloco.titulo && (
          <h3 className="text-base font-semibold text-foreground">{bloco.titulo}</h3>
        )}
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.rotulo ?? c.url}</p>
      </div>
    </a>
  );
}

function BlocoImagem({ bloco }: { bloco: Bloco }) {
  const c = lerConteudo<ConteudoImagem>(bloco);
  if (!c.url) return <BlocoVazio rotulo="Imagem sem URL" />;
  const conteudo = (
    <div className="relative h-full w-full">
      <img
        src={c.url}
        alt={c.alt ?? bloco.titulo ?? "Imagem"}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {bloco.titulo && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-lg font-bold text-foreground">{bloco.titulo}</h3>
          </div>
        </>
      )}
    </div>
  );
  if (c.href) {
    return (
      <a href={c.href} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
        {conteudo}
      </a>
    );
  }
  return conteudo;
}

function BlocoTexto({ bloco }: { bloco: Bloco }) {
  const c = lerConteudo<ConteudoTexto>(bloco);
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(c.texto ?? "");
      setCopiado(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="flex h-full flex-col justify-between gap-4 p-6">
      {bloco.titulo && (
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
          {bloco.titulo}
        </h3>
      )}
      <p className="text-base leading-relaxed text-foreground/90">{c.texto}</p>
      {c.tipo_copia && (
        <button
          type="button"
          onClick={copiar}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/10"
        >
          {copiado ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar
            </>
          )}
        </button>
      )}
    </div>
  );
}

function BlocoMapa({ bloco }: { bloco: Bloco }) {
  const c = lerConteudo<ConteudoMapa>(bloco);
  const temCoords = typeof c.lat === "number" && typeof c.lng === "number";
  const href = temCoords
    ? `https://www.google.com/maps?q=${c.lat},${c.lng}`
    : c.endereco
      ? `https://www.google.com/maps?q=${encodeURIComponent(c.endereco)}`
      : undefined;

  const corpo = (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.6_0.24_295/0.25),transparent_60%),radial-gradient(circle_at_80%_80%,oklch(0.45_0.2_250/0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(oklch(1_0_0/0.04)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-primary/40" />
        <div className="relative grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.6_0.24_295/0.8)]">
          <MapPin className="h-4 w-4" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        {bloco.titulo && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {bloco.titulo}
          </p>
        )}
        <p className="text-base font-bold text-foreground">{c.endereco ?? "Localização"}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
        {corpo}
      </a>
    );
  }
  return corpo;
}

function BlocoVideo({ bloco }: { bloco: Bloco }) {
  const c = lerConteudo<ConteudoVideo>(bloco);
  const embed = c.url ? youtubeEmbed(c.url) : null;
  if (!embed) return <BlocoVazio rotulo="Vídeo do YouTube inválido" />;
  return (
    <div className="relative h-full w-full">
      <iframe
        src={embed}
        title={bloco.titulo ?? "Vídeo"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

function BlocoVazio({ rotulo }: { rotulo: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
      <ImageOff className="h-6 w-6" />
      <p className="text-xs">{rotulo}</p>
    </div>
  );
}

/* -------------------- Despachante -------------------- */
export function ConteudoBlocoView({ bloco }: { bloco: Bloco }) {
  switch (bloco.tipo as TipoBloco) {
    case "link":
      return <BlocoLink bloco={bloco} />;
    case "imagem":
      return <BlocoImagem bloco={bloco} />;
    case "texto":
      return <BlocoTexto bloco={bloco} />;
    case "mapa":
      return <BlocoMapa bloco={bloco} />;
    case "video":
      return <BlocoVideo bloco={bloco} />;
    default:
      return <BlocoVazio rotulo="Tipo desconhecido" />;
  }
}
