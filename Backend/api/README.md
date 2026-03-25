# ⚠️ CRITICAL — READ BEFORE DEPLOYING

## DO NOT PUBLISH THIS FOLDER TO CLOUDFLARE. EVER.

Do **not** press upload. Do **not** deploy. Do **not** include **anything** from this folder in a Cloudflare deployment.

---

## Where This Code Goes

The code in this folder powers the website backend (`api.pennrobotics.org`) and must **only** be deployed to the **Hostinger VM**.

---

## Why This Is Dangerous

Cloudflare Workers run in a **public-facing edge environment** — there is no private server, no isolation, no protection. Deploying backend code there would expose:

- 🔑 API keys and secrets
- 🗄️ Database credentials
- 🔒 Private keys
- 🌐 Internal routes and server-side logic

Anyone who knows where to look could read your credentials, hit unprotected endpoints, or exploit logic that was never meant to be public. This isn't a minor misconfiguration — **it's a full breach.**

---

## The Rule

| Code | Deploy Target |
|------|--------------|
| Frontend | Cloudflare |
| Backend (this folder) | Hostinger VM **only** |

**Wrong target = catastrophic security failure.**
