# AI LifeHub

AI LifeHub brings everyday decisions, studying, general questions, and safer next steps into one calm workspace.

## Installation

From the workspace root:

```bash
pnpm install
```

## Environment

Live AI uses the server-side `OPENAI_API_KEY` Replit Secret. The key is never exposed through `VITE_*`, React code, localStorage, or the browser bundle. If the secret is missing or the provider is unavailable, each endpoint returns a clearly labeled fallback response instead of failing silently.

## Development

```bash
pnpm --filter @workspace/ai-lifehub run dev
```

The application is served through the project preview. The server-side AI endpoints are available under `/api`.

## Production

```bash
pnpm --filter @workspace/ai-lifehub run build
pnpm --filter @workspace/ai-lifehub run serve
```

## Architecture

- `src/App.tsx` and `src/components/` contain the responsive product shell and feature pages.
- `src/lib/storage.ts` provides the browser persistence abstraction for local history and preferences.
- `lib/api-spec/openapi.yaml` is the API contract for the AI and dashboard endpoints.
- `artifacts/api-server/src/routes/ai.ts` validates requests, calls OpenAI on the server, and keeps a structured fallback response for provider outages.
- Generated hooks live in `lib/api-client-react` and are consumed by the frontend.

The browser can continue working during an AI provider outage: user-created history, favorites, chats, plans, and preferences persist locally.

## AI services

The server has separate contract surfaces for market analysis, study explanations, general chat, and SafeHelp. Each response is structured and includes a `demo` flag. The market and SafeHelp copy intentionally uses uncertainty-aware language and avoids presenting authenticity, prices, risk, or diagnoses as facts.

## Fallback mode

Fallback responses are explicitly marked in the interface. Similar marketplace items are illustrative only and are not live listings or current market prices. Live AI responses are still guidance, not professional advice.

## Storage

The UI uses a small storage interface rather than calling `localStorage` throughout components. The interface can later be backed by PostgreSQL, Supabase, or Firebase without changing the feature screens.

## Safety

SafeHelp is not a replacement for a parent, guardian, teacher, doctor, specialist, or emergency service. If there is immediate danger, the interface prompts the user to contact a nearby trusted adult and the appropriate emergency service.