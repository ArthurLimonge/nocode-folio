import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Bloco, Perfil } from "@/lib/types";
import type { Json } from "@/lib/database.types";

/* -------------------- Query keys -------------------- */
export const folioKeys = {
  perfilPorSlug: (slug: string) => ["perfil", "slug", slug] as const,
  meuPerfil: (userId?: string) => ["perfil", "meu", userId] as const,
  blocos: (perfilId?: number, incluirOcultos = false) =>
    ["blocos", perfilId, incluirOcultos] as const,
};

/* -------------------- Perfis -------------------- */
async function fetchPerfilPorSlug(slug: string): Promise<Perfil | null> {
  const { data, error } = await supabase.from("perfis").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export function usePerfilPorSlug(slug: string) {
  return useQuery({
    queryKey: folioKeys.perfilPorSlug(slug),
    queryFn: () => fetchPerfilPorSlug(slug),
    enabled: !!slug,
  });
}

async function fetchMeuPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("usuario_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useMeuPerfil(userId?: string) {
  return useQuery({
    queryKey: folioKeys.meuPerfil(userId),
    queryFn: () => fetchMeuPerfil(userId as string),
    enabled: !!userId,
  });
}

export function useAtualizarPerfil() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: number;
      dados: Partial<
        Pick<Perfil, "nome_completo" | "bio" | "slug" | "avatar_url" | "configuracao_tema">
      >;
    }) => {
      const { data, error } = await supabase
        .from("perfis")
        .update(input.dados)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (perfil) => {
      qc.invalidateQueries({ queryKey: folioKeys.meuPerfil(perfil.usuario_id) });
      qc.invalidateQueries({ queryKey: folioKeys.perfilPorSlug(perfil.slug) });
    },
  });
}

/* -------------------- Blocos -------------------- */
async function fetchBlocos(perfilId: number, incluirOcultos: boolean): Promise<Bloco[]> {
  let query = supabase
    .from("blocos")
    .select("*")
    .eq("perfil_id", perfilId)
    .order("ordem", { ascending: true })
    .order("id", { ascending: true });
  if (!incluirOcultos) query = query.eq("visivel", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function useBlocos(perfilId?: number, incluirOcultos = false) {
  return useQuery({
    queryKey: folioKeys.blocos(perfilId, incluirOcultos),
    queryFn: () => fetchBlocos(perfilId as number, incluirOcultos),
    enabled: !!perfilId,
  });
}

/** Prefixo que casa com ambas as variantes (com/sem ocultos). */
function blocosPrefix(perfilId: number) {
  return ["blocos", perfilId] as const;
}

export function useCriarBloco(perfilId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tipo: Bloco["tipo"];
      titulo?: string | null;
      conteudo: Json;
      colunas?: number;
      linhas?: number;
      ordem: number;
    }) => {
      const { data, error } = await supabase
        .from("blocos")
        .insert({
          perfil_id: perfilId,
          tipo: input.tipo,
          titulo: input.titulo ?? null,
          conteudo: input.conteudo,
          colunas: input.colunas ?? 1,
          linhas: input.linhas ?? 1,
          ordem: input.ordem,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blocosPrefix(perfilId) });
    },
  });
}

export function useAtualizarBloco(perfilId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: number;
      dados: Partial<
        Pick<Bloco, "titulo" | "conteudo" | "colunas" | "linhas" | "visivel" | "tipo">
      >;
    }) => {
      const { data, error } = await supabase
        .from("blocos")
        .update(input.dados)
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blocosPrefix(perfilId) });
    },
  });
}

export function useExcluirBloco(perfilId: number) {
  const qc = useQueryClient();
  const chave = folioKeys.blocos(perfilId, true);
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("blocos").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: chave });
      const anterior = qc.getQueryData<Bloco[]>(chave);
      qc.setQueryData<Bloco[]>(chave, (old) => (old ?? []).filter((b) => b.id !== id));
      return { anterior };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.anterior) {
        qc.setQueryData(chave, ctx.anterior);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: blocosPrefix(perfilId) });
    },
  });
}

/** Reordena blocos com optimistic update e persiste a nova ordem. */
export function useReordenarBlocos(perfilId: number) {
  const qc = useQueryClient();
  const chave = folioKeys.blocos(perfilId, true);
  return useMutation({
    mutationFn: async (ordenados: Bloco[]) => {
      const updates = ordenados.map((b, i) =>
        supabase.from("blocos").update({ ordem: i }).eq("id", b.id),
      );
      const resultados = await Promise.all(updates);
      const falha = resultados.find((r) => r.error);
      if (falha?.error) throw falha.error;
      return ordenados;
    },
    onMutate: async (ordenados) => {
      await qc.cancelQueries({ queryKey: chave });
      const anterior = qc.getQueryData<Bloco[]>(chave);
      qc.setQueryData<Bloco[]>(
        chave,
        ordenados.map((b, i) => ({ ...b, ordem: i })),
      );
      return { anterior };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.anterior) {
        qc.setQueryData(chave, ctx.anterior);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: blocosPrefix(perfilId) });
    },
  });
}

/* -------------------- Leads (newsletter) -------------------- */
export function useInscreverLead(perfilId?: number) {
  return useMutation({
    mutationFn: async (email: string) => {
      if (!perfilId) throw new Error("Perfil inválido.");
      const { error } = await supabase.from("leads").insert({ perfil_id: perfilId, email });
      if (error) throw error;
    },
  });
}
