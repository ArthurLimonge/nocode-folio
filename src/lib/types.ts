import type { Tables } from "./database.types";

export type Perfil = Tables<"perfis">;
export type Bloco = Tables<"blocos">;
export type Lead = Tables<"leads">;

export type TipoBloco = "link" | "imagem" | "texto" | "mapa" | "video";

export const TIPOS_BLOCO: TipoBloco[] = ["link", "imagem", "texto", "mapa", "video"];

/** Formatos do campo `conteudo` (JSONB) por tipo de bloco. */
export interface ConteudoLink {
  url: string;
  rotulo?: string;
}

export interface ConteudoImagem {
  url: string;
  alt?: string;
  href?: string;
}

export interface ConteudoTexto {
  texto: string;
  /** Quando true, exibe botão de copiar (ex.: chave Pix). */
  tipo_copia?: boolean;
}

export interface ConteudoMapa {
  lat?: number;
  lng?: number;
  endereco?: string;
}

export interface ConteudoVideo {
  /** URL do YouTube (watch, youtu.be ou embed). */
  url: string;
}

export type ConteudoBloco =
  | ConteudoLink
  | ConteudoImagem
  | ConteudoTexto
  | ConteudoMapa
  | ConteudoVideo;

/** Rede social armazenada em perfis.configuracao_tema. */
export interface RedeSocial {
  rede: string;
  url: string;
}

export interface ConfiguracaoTema {
  redes?: RedeSocial[];
}

export function lerConfiguracaoTema(perfil: Perfil): ConfiguracaoTema {
  const cfg = perfil.configuracao_tema;
  if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
    return cfg as ConfiguracaoTema;
  }
  return {};
}

/** Lê o conteudo de um bloco com o tipo esperado. */
export function lerConteudo<T>(bloco: Bloco): T {
  const c = bloco.conteudo;
  if (c && typeof c === "object" && !Array.isArray(c)) {
    return c as unknown as T;
  }
  return {} as T;
}

export const TIPO_LABEL: Record<TipoBloco, string> = {
  link: "Link",
  imagem: "Imagem",
  texto: "Texto",
  mapa: "Mapa",
  video: "Vídeo",
};
