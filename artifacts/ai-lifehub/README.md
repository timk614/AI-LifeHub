# AI LifeHub

AI LifeHub brings everyday decisions, studying, general questions, and safer next steps into one calm workspace.

## Installation

From the workspace root:

```bash
pnpm install
```

## Environment

The first build runs in DEMO MODE and needs no API key. For a future direct OpenAI deployment, copy `.env.example` and set `OPENAI_API_KEY` only on the server. Never expose it through `VITE_*`, React code, localStorage, or the browser bundle.

## Development

```bash
pnpm --filter @workspace/ai-lifehub run dev
```

The application is served through the project preview. The server-side demo endpoints are available under `/api`.

## Production

```bash
pnpm --filter @workspace/ai-lifehub run build
pnpm --filter @workspace/ai-lifehub run serve
```

## Architecture

- `src/App.tsx` and `src/components/` contain the responsive product shell and feature pages.
- `src/lib/storage.ts` provides the browser persistence abstraction used by the DEMO mode.
- `lib/api-spec/openapi.yaml` is the API contract for the AI and dashboard endpoints.
- `artifacts/api-server/src/routes/ai.ts` validates requests and returns structured, clearly labeled demo responses.
- Generated hooks live in `lib/api-client-react` and are consumed by the frontend.

The browser can continue working without an AI provider: user-created history, favorites, chats, plans, and preferences persist locally. This makes it possible to explore every flow safely before connecting a model.

## AI services

The server has separate contract surfaces for market analysis, study explanations, general chat, and SafeHelp. Each response is structured and includes a `demo` flag. The market and SafeHelp copy intentionally uses uncertainty-aware language and avoids presenting authenticity, prices, risk, or diagnoses as facts.

## DEMO mode

Demo data is explicitly marked in the interface. Similar marketplace items are illustrative only and are not live listings or current market prices. The AI demo responses are predictable starter guidance, not professional advice.

## Storage

The UI uses a small storage interface rather than calling `localStorage` throughout components. The interface can later be backed by PostgreSQL, Supabase, or Firebase without changing the feature screens.

## Safety

SafeHelp is not a replacement for a parent, guardian, teacher, doctor, specialist, or emergency service. If there is immediate danger, the interface prompts the user to contact a nearby trusted adult and the appropriate emergency service.