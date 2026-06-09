import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TIPOS_BLOCO, TIPO_LABEL, lerConteudo, type Bloco, type TipoBloco } from "@/lib/types";
import type { Json } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export interface PayloadBloco {
  tipo: TipoBloco;
  titulo: string | null;
  conteudo: Json;
  colunas: number;
  linhas: number;
  visivel: boolean;
}

interface EditorBlocoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  blocoInicial?: Bloco | null;
  salvando: boolean;
  onSalvar: (payload: PayloadBloco) => void;
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function EditorBloco({
  open,
  onOpenChange,
  blocoInicial,
  salvando,
  onSalvar,
}: EditorBlocoProps) {
  const editando = !!blocoInicial;
  const [tipo, setTipo] = useState<TipoBloco>("link");
  const [titulo, setTitulo] = useState("");
  const [colunas, setColunas] = useState(1);
  const [linhas, setLinhas] = useState(1);
  const [visivel, setVisivel] = useState(true);
  const [campos, setCampos] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    if (!open) return;
    if (blocoInicial) {
      setTipo(blocoInicial.tipo as TipoBloco);
      setTitulo(blocoInicial.titulo ?? "");
      setColunas(blocoInicial.colunas);
      setLinhas(blocoInicial.linhas);
      setVisivel(blocoInicial.visivel);
      setCampos(lerConteudo<Record<string, string | boolean>>(blocoInicial) ?? {});
    } else {
      setTipo("link");
      setTitulo("");
      setColunas(1);
      setLinhas(1);
      setVisivel(true);
      setCampos({});
    }
  }, [open, blocoInicial]);

  const setCampo = (chave: string, valor: string | boolean) =>
    setCampos((c) => ({ ...c, [chave]: valor }));

  const montarConteudo = (): Json => {
    switch (tipo) {
      case "link":
        return { url: str(campos.url), rotulo: str(campos.rotulo) };
      case "imagem":
        return { url: str(campos.url), alt: str(campos.alt), href: str(campos.href) };
      case "texto":
        return { texto: str(campos.texto), tipo_copia: !!campos.tipo_copia };
      case "mapa":
        return {
          endereco: str(campos.endereco),
          lat: num(campos.lat),
          lng: num(campos.lng),
        };
      case "video":
        return { url: str(campos.url) };
      default:
        return {};
    }
  };

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar({
      tipo,
      titulo: titulo.trim() || null,
      conteudo: montarConteudo(),
      colunas,
      linhas,
      visivel,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-h-[90vh] overflow-y-auto border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar bloco" : "Adicionar bloco"}</DialogTitle>
          <DialogDescription>
            Escolha o tipo e preencha o conteúdo. Os campos mudam conforme o tipo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submeter} className="space-y-4">
          <div>
            <label className={labelCls}>Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_BLOCO.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    tipo === t
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Título (opcional)</label>
            <input
              className={inputCls}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Meu portfólio"
            />
          </div>

          {/* Campos dinâmicos por tipo */}
          {tipo === "link" && (
            <>
              <Campo label="URL" obrigatorio>
                <input
                  className={inputCls}
                  type="url"
                  required
                  value={str(campos.url)}
                  onChange={(e) => setCampo("url", e.target.value)}
                  placeholder="https://..."
                />
              </Campo>
              <Campo label="Rótulo do botão">
                <input
                  className={inputCls}
                  value={str(campos.rotulo)}
                  onChange={(e) => setCampo("rotulo", e.target.value)}
                  placeholder="Acesse o site"
                />
              </Campo>
            </>
          )}

          {tipo === "imagem" && (
            <>
              <Campo label="URL da imagem" obrigatorio>
                <input
                  className={inputCls}
                  type="url"
                  required
                  value={str(campos.url)}
                  onChange={(e) => setCampo("url", e.target.value)}
                  placeholder="https://.../imagem.jpg"
                />
              </Campo>
              <Campo label="Texto alternativo">
                <input
                  className={inputCls}
                  value={str(campos.alt)}
                  onChange={(e) => setCampo("alt", e.target.value)}
                />
              </Campo>
              <Campo label="Link ao clicar (opcional)">
                <input
                  className={inputCls}
                  type="url"
                  value={str(campos.href)}
                  onChange={(e) => setCampo("href", e.target.value)}
                  placeholder="https://..."
                />
              </Campo>
            </>
          )}

          {tipo === "texto" && (
            <>
              <Campo label="Texto" obrigatorio>
                <textarea
                  className={cn(inputCls, "min-h-24 resize-y")}
                  required
                  value={str(campos.texto)}
                  onChange={(e) => setCampo("texto", e.target.value)}
                  placeholder="Sua mensagem, chave Pix, etc."
                />
              </Campo>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={!!campos.tipo_copia}
                  onChange={(e) => setCampo("tipo_copia", e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-background accent-primary"
                />
                Mostrar botão de copiar (ex.: chave Pix)
              </label>
            </>
          )}

          {tipo === "mapa" && (
            <>
              <Campo label="Endereço" obrigatorio>
                <input
                  className={inputCls}
                  required
                  value={str(campos.endereco)}
                  onChange={(e) => setCampo("endereco", e.target.value)}
                  placeholder="Av. Paulista, 1000 - São Paulo"
                />
              </Campo>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="Latitude (opcional)">
                  <input
                    className={inputCls}
                    value={str(campos.lat)}
                    onChange={(e) => setCampo("lat", e.target.value)}
                    placeholder="-23.55"
                  />
                </Campo>
                <Campo label="Longitude (opcional)">
                  <input
                    className={inputCls}
                    value={str(campos.lng)}
                    onChange={(e) => setCampo("lng", e.target.value)}
                    placeholder="-46.63"
                  />
                </Campo>
              </div>
            </>
          )}

          {tipo === "video" && (
            <Campo label="URL do YouTube" obrigatorio>
              <input
                className={inputCls}
                type="url"
                required
                value={str(campos.url)}
                onChange={(e) => setCampo("url", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Campo>
          )}

          {/* Tamanho na grid */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Largura (colunas)">
              <select
                className={inputCls}
                value={colunas}
                onChange={(e) => setColunas(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n} className="bg-background">
                    {n} coluna{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Altura (linhas)">
              <select
                className={inputCls}
                value={linhas}
                onChange={(e) => setLinhas(Number(e.target.value))}
              >
                {[1, 2].map((n) => (
                  <option key={n} value={n} className="bg-background">
                    {n} linha{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={visivel}
              onChange={(e) => setVisivel(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-background accent-primary"
            />
            Bloco visível no perfil público
          </label>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {editando ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  label,
  obrigatorio,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label} {obrigatorio && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function num(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : undefined;
}
