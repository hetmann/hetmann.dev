# Hetmann Technologies — hetmann.dev

Company presentation website built with React, TypeScript, Vite and Three.js.

## Local development

Use Node.js 22 and pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Deployment

Pushes to `main` build and deploy `dist/` through GitHub Actions to GitHub Pages.
In repository Settings → Pages, select **GitHub Actions** as the source and
set the custom domain to **hetmann.dev**. Enable **Enforce HTTPS** once the
certificate is ready.

The Vite base remains `/` for the custom domain. `public/CNAME` is copied into
the build; the domain must also be configured in GitHub Pages settings.

In the Cloudflare DNS zone for `hetmann.dev`, configure the following records
with **DNS only** (proxy disabled) and automatic TTL:

| Type | Name | Target |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | hetmann.github.io |

Check existing apex and www A/AAAA/CNAME records for conflicts before applying.
Preserve email records and unrelated subdomains. Configure the GitHub custom
domain before pointing DNS to GitHub Pages.

The contact email remains `contact@hetmann.tech`.

```sh
pnpm build
pnpm preview
```
