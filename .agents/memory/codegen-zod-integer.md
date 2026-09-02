---
name: OpenAPI integer codegen compatibility
description: The repository's current Orval/Zod combination emits zod.int() for OpenAPI integer schemas, but the installed Zod version does not expose that API.
---

Use `type: number` for generated API contracts when the client/server only need numeric values and the current Zod dependency must remain unchanged.

**Why:** Code generation completes, but the workspace typecheck fails on generated `zod.int()` calls with the installed Zod version.

**How to apply:** If integer semantics become important, upgrade and verify the shared Zod/Orval versions together instead of hand-editing generated files.