# Wildcard Subdomain Setup (Vercel + Bigrock)

How to configure DNS so tenants resolve like this (see [src/utils/subdomain.js](src/utils/subdomain.js)):

| URL                     | Result                     |
| ------------------------ | --------------------------- |
| `currez.in`              | root marketing site (`null`) |
| `www.currez.in`          | root marketing site (`null`) |
| `abc.currez.in`          | tenant `"abc"`               |
| `www.abc.currez.in`      | tenant `"abc"`               |

Replace `currez.in` below with your real domain.

## 0. Prerequisite: Vercel plan

Wildcard domains (`*.currez.in`) can only be added to a project on a **Pro or Enterprise** Vercel plan — the Hobby (free) plan does not support them. Confirm your plan before starting, otherwise the wildcard domain step below will fail.

## 1. Add domains in Vercel

In the Vercel project → **Settings → Domains**, add all three:

- `currez.in`
- `www.currez.in`
- `*.currez.in`

Vercel will mark them "Invalid Configuration" until the DNS records below are in place — that's expected.

## 2. Add DNS records in Bigrock

Log in to Bigrock → **My Orders → Domain → Manage → DNS Management / Advanced DNS Zone Editor** for `currez.in`, and add:

| Type  | Host / Name | Value                  | Notes                              |
| ----- | ----------- | ----------------------- | ----------------------------------- |
| A     | `@`         | `76.76.21.21`            | Apex domain — confirm this exact IP against the value Vercel shows on the domain's page, it can change |
| CNAME | `www`       | `cname.vercel-dns.com`   | www subdomain                       |
| CNAME | `*`         | `cname.vercel-dns.com`   | Wildcard — enables every tenant subdomain |

Notes:
- Bigrock usually ships a default parking `A` record for `@` and sometimes a `www` CNAME — **delete/replace** those, don't add duplicates.
- Bigrock's zone editor may not accept `*` directly in some UIs; if so, look for a "Subdomain" or "Host" field and enter `*` there, or use their "Wildcard" record helper if present.
- Don't switch Bigrock's nameservers to Vercel's for this setup — keep Bigrock as the DNS host and just add the records above (simpler to reason about, and this is the flow described here).

## 3. Environment variable

`VITE_APP_BASE_URL` in this codebase is **not** your production custom domain — it's your Vercel-assigned fallback domain (e.g. `https://your-project.vercel.app`). It exists purely so that visiting the raw `*.vercel.app` URL is treated as root instead of being misparsed as a tenant subdomain. Once `currez.in` is live, requests to the apex/`www` naturally resolve to root via the existing hostname checks — no change needed there.

Set it in Vercel → **Settings → Environment Variables**:

```
VITE_APP_BASE_URL=https://your-project.vercel.app
```

## 4. Verify

1. In Vercel → Domains, wait for all three domains to show "Valid Configuration" (DNS propagation is usually minutes, can take up to ~24h).
2. SSL certificates (including the wildcard cert) are issued automatically by Vercel once DNS validates — no action needed.
3. Test:
   - `https://currez.in` → root site
   - `https://www.currez.in` → root site
   - `https://abc.currez.in` → tenant `abc`
   - `https://www.abc.currez.in` → tenant `abc`

## Troubleshooting

- **Domain stuck "Invalid Configuration"**: re-check the record values against what Vercel's dashboard shows for that specific domain (it sometimes differs slightly per account/region) and confirm no leftover parking records remain in Bigrock.
- **Wildcard subdomain 404s but root works**: usually means the plan doesn't support wildcard domains, or the `*` CNAME record wasn't saved correctly by Bigrock — re-open the zone editor and confirm it's listed.
- **`www.abc.currez.in` doesn't resolve to the tenant**: make sure you're on the updated `getTenantSlug` logic in [src/utils/subdomain.js](src/utils/subdomain.js) — the previous version treated any `www.`-prefixed host as root, even for `www.abc.currez.in`.
