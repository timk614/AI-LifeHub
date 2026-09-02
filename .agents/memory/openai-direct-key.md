---
name: Direct OpenAI key handling
description: Live AI uses a server-only OpenAI secret when the built-in Replit AI integration cannot be enabled.
---

The built-in Replit AI integration may require an account upgrade; a direct OpenAI key is a viable server-side alternative. OpenAI authentication errors can echo part of a key, so provider errors must be sanitized before logging. An env example file is not a credential and cannot replace the protected Replit Secret.

**Why:** A failed live request exposed that provider error text can contain sensitive key material and that a configured secret can still be rejected by the provider.

**How to apply:** Keep the key server-only, request or replace it through Replit Secrets, redact provider errors, and treat a 401 as a credential problem rather than silently claiming live AI is available.