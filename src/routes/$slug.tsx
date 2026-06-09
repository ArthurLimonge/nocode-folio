import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Pencil,
  Check,
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  LogOut,
  Loader2,
  Instagram,
  Github,
  Linkedin,
  Youtube,
  Globe,
  Twitter,
  Mail,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  useAtualizarBloco,
  useAtualizarPerfil,
  useBlocos,
  useCriarBloco,
  useExcluirBloco,
  useInscreverLead,
  usePerfilPorSlug,
  useReordenarBlocos,
} from "@/lib/api/folio";
import { lerConfiguracaoTema, type Bloco, type Perfil, type RedeSocial } from "@/lib/types";
import { ConteudoBlocoView, classesGrid } from "@/components/blocos";
import { EditorBloco, type PayloadBloco } from "@/components/editor-bloco";
import { EditorPerfil, type PayloadPerfil } from "@/components/editor-perfil";

export const Route = createFileRoute("/$slug")({
  head: () => ({
    meta: [{ title: "Perfil — NoCode Folio" }],
  }),
  component: PerfilPublico,
});

function PerfilPublico() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const { data: perfil, isLoading, isError } = usePerfilPorSlug(slug);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </main>
    );
  }

  if (isError || !perfil) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground">Perfil não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Não existe um folio com o endereço <span className="text-foreground">/{slug}</span>.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  const ehDono = !!user && user.id === perfil.usuario_id;
  return <Conteudo perfil={perfil} ehDono={ehDono} />;
}

function Conteudo({ perfil, ehDono }: { perfil: Perfil; ehDono: boolean }) {
  const { signOut } = useAuth();
  const [editando, setEditando] = useState(false);
  const [modalBloco, setModalBloco] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [blocoEditando, setBlocoEditando] = useState<Bloco | null>(null);

  const { data: blocos = [] } = useBlocos(perfil.id, ehDono && editando);

  const criar = useCriarBloco(perfil.id);
  const atualizar = useAtualizarBloco(perfil.id);
  const excluir = useExcluirBloco(perfil.id);
  const reordenar = useReordenarBlocos(perfil.id);
  const atualizarPerfil = useAtualizarPerfil();

  const redes = useMemo(() => lerConfiguracaoTema(perfil).redes ?? [], [perfil]);

  const mover = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= blocos.length) return;
    const next = [...blocos];
    [next[from], next[to]] = [next[to], next[from]];
    reordenar.mutate(next);
  };

  const abrirNovo = () => {
    setBlocoEditando(null);
    setModalBloco(true);
  };

  const abrirEdicao = (b: Bloco) => {
    setBlocoEditando(b);
    setModalBloco(true);
  };

  const salvarBloco = (payload: PayloadBloco) => {
    if (blocoEditando) {
      atualizar.mutate(
        {
          id: blocoEditando.id,
          dados: {
            tipo: payload.tipo,
            titulo: payload.titulo,
            conteudo: payload.conteudo,
            colunas: payload.colunas,
            linhas: payload.linhas,
            visivel: payload.visivel,
          },
        },
        {
          onSuccess: () => {
            toast.success("Bloco atualizado");
            setModalBloco(false);
          },
          onError: (e) => toast.error(mensagem(e)),
        },
      );
    } else {
      criar.mutate(
        {
          tipo: payload.tipo,
          titulo: payload.titulo,
          conteudo: payload.conteudo,
          colunas: payload.colunas,
          linhas: payload.linhas,
          ordem: blocos.length,
        },
        {
          onSuccess: () => {
            toast.success("Bloco adicionado");
            setModalBloco(false);
          },
          onError: (e) => toast.error(mensagem(e)),
        },
      );
    }
  };

  const salvarPerfil = (dados: PayloadPerfil) => {
    atualizarPerfil.mutate(
      { id: perfil.id, dados },
      {
        onSuccess: () => {
          toast.success("Perfil atualizado");
          setModalPerfil(false);
        },
        onError: (e) => toast.error(mensagem(e)),
      },
    );
  };

  const compartilhar = async () => {
    const url = `${window.location.origin}/${perfil.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: perfil.nome_completo ?? "Folio", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      /* cancelado */
    }
  };

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-32 pt-10 sm:px-6 sm:pt-14 lg:pt-20">
      <header className="mb-8 flex items-center justify-between sm:mb-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_18px_oklch(0.6_0.24_295/0.6)]">
            <span className="text-sm font-black text-primary-foreground">N</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            NoCode <span className="text-muted-foreground">Folio</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={compartilhar}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-primary/10"
          >
            <Share2 className="h-3.5 w-3.5" />
            Compartilhar
          </button>
          {ehDono && (
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <ProfileHeader perfil={perfil} redes={redes} />

      <section className="bento-grid" aria-label="Perfil em grade Bento">
        {blocos.map((b, i) => (
          <article
            key={b.id}
            className={cn(
              "glass-card glass-card-hover animate-bento-in relative overflow-hidden",
              classesGrid(b.colunas, b.linhas),
              editando && "animate-wiggle",
              !b.visivel && "opacity-50",
            )}
            style={{ animationDelay: editando ? "0s" : `${i * 70}ms` }}
          >
            <ConteudoBlocoView bloco={b} />

            {editando && (
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-2">
                <div className="flex gap-1">
                  <BotaoIcone
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    label="Mover para cima"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </BotaoIcone>
                  <BotaoIcone
                    onClick={() => mover(i, 1)}
                    disabled={i === blocos.length - 1}
                    label="Mover para baixo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </BotaoIcone>
                </div>
                <div className="flex gap-1">
                  <BotaoIcone onClick={() => abrirEdicao(b)} label="Editar">
                    <Pencil className="h-4 w-4" />
                  </BotaoIcone>
                  <BotaoIcone
                    onClick={() => {
                      excluir.mutate(b.id, {
                        onSuccess: () => toast.success("Bloco excluído"),
                        onError: (e) => toast.error(mensagem(e)),
                      });
                    }}
                    label="Excluir"
                    destrutivo
                  >
                    <Trash2 className="h-4 w-4" />
                  </BotaoIcone>
                </div>
              </div>
            )}
          </article>
        ))}

        {editando && (
          <button
            type="button"
            onClick={abrirNovo}
            className="grid min-h-[140px] place-items-center rounded-3xl border-2 border-dashed border-white/15 text-muted-foreground transition hover:border-primary/50 hover:text-foreground sm:min-h-[170px]"
          >
            <span className="flex flex-col items-center gap-2 text-sm font-medium">
              <Plus className="h-6 w-6" />
              Adicionar bloco
            </span>
          </button>
        )}
      </section>

      {blocos.length === 0 && !editando && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          {ehDono
            ? "Sua grade está vazia. Toque em “Editar perfil” para adicionar blocos."
            : "Este perfil ainda não tem blocos."}
        </div>
      )}

      <NewsletterPublica perfilId={perfil.id} />

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Feito com <span className="text-foreground">NoCode Folio</span> · Bento UI
      </p>

      {ehDono && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          {editando && (
            <button
              type="button"
              onClick={() => setModalPerfil(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-background/80 px-4 py-3 text-sm font-medium text-foreground shadow-lg backdrop-blur transition hover:border-primary/40"
            >
              <Pencil className="h-4 w-4" />
              Editar perfil
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditando((e) => !e)}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold shadow-[0_12px_40px_-8px_oklch(0.6_0.24_295/0.6)] transition active:scale-95",
              editando
                ? "bg-foreground text-background"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
            )}
          >
            {editando ? (
              <>
                <Check className="h-4 w-4" />
                Concluir
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Editar grade
              </>
            )}
          </button>
        </div>
      )}

      <EditorBloco
        open={modalBloco}
        onOpenChange={setModalBloco}
        blocoInicial={blocoEditando}
        salvando={criar.isPending || atualizar.isPending}
        onSalvar={salvarBloco}
      />
      <EditorPerfil
        open={modalPerfil}
        onOpenChange={setModalPerfil}
        perfil={perfil}
        salvando={atualizarPerfil.isPending}
        onSalvar={salvarPerfil}
      />
    </main>
  );
}

/* -------------------- Header do perfil -------------------- */
function ProfileHeader({ perfil, redes }: { perfil: Perfil; redes: RedeSocial[] }) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 text-center sm:mb-10">
      <div className="relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-primary to-primary-glow opacity-60 blur-md" />
        {perfil.avatar_url ? (
          <img
            src={perfil.avatar_url}
            alt={perfil.nome_completo ?? "Avatar"}
            className="relative h-24 w-24 rounded-[1.5rem] object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="relative grid h-24 w-24 place-items-center rounded-[1.5rem] bg-white/5 text-3xl font-bold text-foreground ring-1 ring-white/10">
            {(perfil.nome_completo ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {perfil.nome_completo ?? perfil.slug}
        </h1>
        {perfil.bio && (
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            {perfil.bio}
          </p>
        )}
      </div>
      {redes.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {redes.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:border-primary/40 hover:bg-primary/10"
              aria-label={r.rede}
            >
              <IconeRede rede={r.rede} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function IconeRede({ rede }: { rede: string }) {
  const cls = "h-4 w-4";
  switch (rede.toLowerCase()) {
    case "instagram":
      return <Instagram className={cls} />;
    case "github":
      return <Github className={cls} />;
    case "linkedin":
      return <Linkedin className={cls} />;
    case "youtube":
      return <Youtube className={cls} />;
    case "x":
    case "twitter":
      return <Twitter className={cls} />;
    default:
      return <Globe className={cls} />;
  }
}

/* -------------------- Newsletter pública (leads) -------------------- */
function NewsletterPublica({ perfilId }: { perfilId: number }) {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const inscrever = useInscreverLead(perfilId);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    inscrever.mutate(email, {
      onSuccess: () => {
        setOk(true);
        setEmail("");
        toast.success("Inscrição confirmada!");
      },
      onError: (err) => toast.error(mensagem(err)),
    });
  };

  return (
    <div className="mx-auto mt-12 max-w-xl">
      <div className="glass-card flex flex-col gap-4 p-6 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <UserPlus className="h-3.5 w-3.5" />
          Newsletter
        </div>
        {ok ? (
          <p className="text-sm text-foreground">Pronto! Você receberá novidades em breve.</p>
        ) : (
          <form
            onSubmit={enviar}
            className="flex items-center rounded-full border border-white/10 bg-background/40 p-1.5 focus-within:border-primary/60 transition"
          >
            <Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              type="submit"
              disabled={inscrever.isPending}
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-glow disabled:opacity-60"
            >
              {inscrever.isPending ? "..." : "Assinar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------- Auxiliares -------------------- */
function BotaoIcone({
  children,
  onClick,
  disabled,
  label,
  destrutivo,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  destrutivo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-background/70 backdrop-blur transition disabled:opacity-30",
        destrutivo
          ? "text-destructive hover:bg-destructive/30"
          : "text-foreground hover:bg-primary/30",
      )}
    >
      {children}
    </button>
  );
}

function mensagem(e: unknown): string {
  return e instanceof Error ? e.message : "Algo deu errado";
}
