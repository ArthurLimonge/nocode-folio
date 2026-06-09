import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { lerConfiguracaoTema, type Perfil, type RedeSocial } from "@/lib/types";
import type { Json } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export interface PayloadPerfil {
  nome_completo: string | null;
  bio: string | null;
  slug: string;
  avatar_url: string | null;
  configuracao_tema: Json;
}

interface EditorPerfilProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  perfil: Perfil;
  salvando: boolean;
  onSalvar: (dados: PayloadPerfil) => void;
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

const REDES_SUGERIDAS = ["instagram", "github", "linkedin", "youtube", "x", "site"];

export function EditorPerfil({
  open,
  onOpenChange,
  perfil,
  salvando,
  onSalvar,
}: EditorPerfilProps) {
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [redes, setRedes] = useState<RedeSocial[]>([]);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setNome(perfil.nome_completo ?? "");
    setBio(perfil.bio ?? "");
    setSlug(perfil.slug);
    setAvatarUrl(perfil.avatar_url);
    setRedes(lerConfiguracaoTema(perfil).redes ?? []);
  }, [open, perfil]);

  const enviarAvatar = async (file: File) => {
    setEnviandoAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const caminho = `${perfil.usuario_id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatares")
        .upload(caminho, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatares").getPublicUrl(caminho);
      setAvatarUrl(data.publicUrl);
      toast.success("Avatar enviado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar avatar");
    } finally {
      setEnviandoAvatar(false);
    }
  };

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    const slugLimpo = slug.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(slugLimpo)) {
      toast.error("Slug inválido: use 3 a 30 letras minúsculas, números ou hífen.");
      return;
    }
    const redesValidas = redes.filter((r) => r.rede && r.url);
    onSalvar({
      nome_completo: nome.trim() || null,
      bio: bio.trim() || null,
      slug: slugLimpo,
      avatar_url: avatarUrl,
      configuracao_tema: { redes: redesValidas } as unknown as Json,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-h-[90vh] overflow-y-auto border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Atualize seus dados públicos e o endereço da sua página.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submeter} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-white/5 text-2xl font-bold text-muted-foreground">
                  {(nome || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) enviarAvatar(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={enviandoAvatar}
                onClick={() => fileRef.current?.click()}
              >
                {enviandoAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Enviar foto
              </Button>
              <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG ou WebP.</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nome completo</label>
            <input
              className={inputCls}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className={labelCls}>Bio</label>
            <textarea
              className={cn(inputCls, "min-h-20 resize-y")}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Uma breve descrição sobre você"
            />
          </div>

          <div>
            <label className={labelCls}>Endereço (slug)</label>
            <div className="flex items-center rounded-lg border border-white/10 bg-background/50 px-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <span className="text-sm text-muted-foreground">folio/</span>
              <input
                className="flex-1 bg-transparent px-1 py-2 text-sm text-foreground focus:outline-none"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="seu-nome"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={cn(labelCls, "mb-0")}>Redes sociais</label>
              <button
                type="button"
                onClick={() => setRedes((r) => [...r, { rede: "instagram", url: "" }])}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {redes.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <select
                    className={cn(inputCls, "w-32")}
                    value={r.rede}
                    onChange={(e) =>
                      setRedes((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, rede: e.target.value } : x)),
                      )
                    }
                  >
                    {REDES_SUGERIDAS.map((s) => (
                      <option key={s} value={s} className="bg-background">
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputCls}
                    value={r.url}
                    onChange={(e) =>
                      setRedes((arr) =>
                        arr.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
                      )
                    }
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => setRedes((arr) => arr.filter((_, j) => j !== i))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-destructive hover:bg-destructive/10"
                    aria-label="Remover rede"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando || enviandoAvatar}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar perfil
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
