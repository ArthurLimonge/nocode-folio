# nocode-folio

Portfólio construído com TanStack Start + React 19 + Vite + Tailwind v4.

## Ambiente e comandos

- Usar **pnpm** (não npm nem yarn).
- Rodar o dev server com `pnpm run dev` (porta 3000).
- Build com `pnpm run build`; lint com `pnpm run lint`; formatação com `pnpm run format`.
- Se o esbuild falhar na instalação: `pnpm approve-builds esbuild`.

## Vite / Lovable

- O `vite.config.ts` usa `@lovable.dev/vite-tanstack-config`.
- NÃO adicionar plugins manualmente (tanstackStart, viteReact, tailwindcss, tsConfigPaths, etc. já vêm do wrapper).
- Configuração extra de Vite vai dentro de `vite: { ... }`.

## Estrutura

- Componentes em `src/components/` (UI base em `src/components/ui/`).
- Rotas em `src/routes/`.
- Utilitários em `src/lib/`.
- Código sensível/servidor em arquivos `*.server.ts`.

## Convenções

- TypeScript em todos os arquivos novos.
- Componentes funcionais com named exports.
- Seguir as regras de segurança em `.cursor/rules/security.mdc`.
