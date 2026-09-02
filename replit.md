# AI LifeHub

AI LifeHub is a responsive demo-ready AI companion for secondhand shopping decisions, study support, general questions, and safer next steps.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-lifehub` — the deployable React + Vite web app
- `artifacts/api-server/src/routes/ai.ts` — validated AI demo endpoints
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-client-react` and `lib/api-zod` — generated API hooks and schemas

## Architecture decisions

- The first release is demo-first: every primary flow works without a model key.
- Browser persistence is isolated behind a storage abstraction so it can be replaced with a database later.
- AI responses are structured and validated at the server boundary.
- Safety and market responses use uncertainty-aware language rather than presenting guesses as facts.

## Product

The app includes Dashboard, Market AI, StudyAI, AI Assistant, SafeHelp, History, Favorites, Settings, and Profile routes with responsive desktop sidebar and mobile navigation.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
