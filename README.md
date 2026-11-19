# Yayasan Tarumanagara Website

The official website of **Yayasan Tarumanagara** (Tarumanagara Foundation), a non-profit foundation established in 1959 that serves the public in education, healthcare, and community service.

The project consists of two parts:

- A **public website** presenting the foundation, its business units, news and activities, and career opportunities.
- An **administration panel** (CMS) through which authorised staff manage news, the organisational governance roster, job vacancies, and incoming job applications.

Production URL: <https://tarumanagara.org>

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Database](#database)
7. [Authentication and Access Control](#authentication-and-access-control)
8. [File and Image Storage](#file-and-image-storage)
9. [Caching and Revalidation](#caching-and-revalidation)
10. [Static Content](#static-content)
11. [Search Engine Optimisation](#search-engine-optimisation)
12. [Project Structure](#project-structure)
13. [Available Scripts](#available-scripts)
14. [Deployment](#deployment)
15. [Domain, DNS, and Search Console](#domain-dns-and-search-console)
16. [Security Considerations](#security-considerations)
17. [Troubleshooting](#troubleshooting)
18. [Notes for Contributors](#notes-for-contributors)

---

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| UI library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI primitives) |
| Database | Turso (libSQL, SQLite-compatible) |
| ORM and migrations | Drizzle ORM, drizzle-kit |
| Authentication | Signed JWT session cookie (`jose`), scrypt password hashing (Node.js `crypto`) |
| Forms and validation | React Hook Form, Zod |
| Animation | Motion (formerly Framer Motion) |
| Notifications | Sonner |
| Spreadsheet export | ExcelJS |
| Typeface | Plus Jakarta Sans (self-hosted variable font) |
| Hosting | Vercel |

---

## Features

### Public Website

| Route | Description |
| --- | --- |
| `/` | Home page: hero section, welcome message from the Chairman, the foundation's business units grouped by sector, and a carousel of the latest news. |
| `/tentang-kami` | About Us: history, vision and mission, and the organisational governance roster (Pembina, Pengurus, Pengawas), managed from the admin panel. |
| `/karir` | Careers: open job vacancies, read from the database. |
| `/karir/kirim-cv` | Application form. Applicants submit their personal details, the position applied for, and a CV file (PDF, DOC, or DOCX, up to 5 MB). |
| `/berita` | News and Activities: all published articles, filterable by category tabs, with incremental "load more" pagination. |
| `/berita/[slug]` | Article detail page, including a share button and structured data for search engines. |
| `/berita/[slug]/cover` | Crawlable cover image for each article, used for social media link previews. |

### Administration Panel

The panel is available at `/admin` and requires an authenticated account.

| Route | Description | Roles |
| --- | --- | --- |
| `/admin/login` | Sign-in page, protected against brute-force attempts. | Public |
| `/admin` | Dashboard summarising the sections available to the signed-in role. | All roles |
| `/admin/berita` | Create, edit, publish or unpublish, and delete news articles, including cover image, caption, author, date, tags, and category. Includes search and filtering. | `master`, `humas` |
| `/admin/berita/kategori` | Manage the news category tabs shown on `/berita`, including their display order. | `master`, `humas` |
| `/admin/tata-kelola` | Manage the governance roster: name, position, portrait, portrait crop, role, display order, and visibility. | `master` |
| `/admin/lowongan` | Create, edit, open or close, and delete job vacancies. | `master`, `hr` |
| `/admin/lamaran` | Review job applications, search and filter them, download CV files, and export the filtered list to an Excel workbook. | `master`, `hr` |
| `/admin/akun` | Change your own password. The Admin Master can also reset the password of any other account. | All roles |

---

## Prerequisites

- **Node.js 20.9 or later** (required by Next.js 16)
- **npm** (the repository includes a `package-lock.json`)
- For hosted databases: a **Turso** account, and optionally the [Turso CLI](https://docs.turso.tech/cli/installation). Local development can use a SQLite file instead.
- A **Vercel** account for deployment

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Choose a development database

The simplest option is a local SQLite file, which needs no account or credentials. Alternatively, create a Turso database in the Turso dashboard or with the CLI:

```bash
turso auth login
turso db create yayasan-tarumanagara-dev
turso db show yayasan-tarumanagara-dev --url      # value for TURSO_DATABASE_URL
turso db tokens create yayasan-tarumanagara-dev   # value for TURSO_AUTH_TOKEN
```

### 3. Configure environment variables

Create `.env.development.local` in the project root. For a local SQLite file:

```env
TURSO_DATABASE_URL=file:local.db
AUTH_SECRET=<random secret>
```

For a Turso database, also set `TURSO_AUTH_TOKEN`, as described in [Environment Variables](#environment-variables). Step-by-step instructions for both options are in [SETUP.md](./SETUP.md#part-a-local-development-environment).

### 4. Create the database tables

```bash
npm run db:push
```

This applies the Drizzle schema in `src/lib/db/schema.ts` to the database referenced by `.env.development.local`.

### 5. Create an administrator account

```bash
npm run create-admin -- "admin@example.com" "a-strong-password" master
```

### 6. Start the development server

```bash
npm run dev
```

The site is then available at <http://localhost:3000>, and the admin panel at <http://localhost:3000/admin>.

> The public pages read their content from the database, so a configured database (a Turso database or a local SQLite file) is required to run the application. A new database starts empty.

---

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Yes | libSQL URL of the Turso database, for example `libsql://<database>-<organisation>.turso.io`, or `file:local.db` for a local SQLite file. |
| `TURSO_AUTH_TOKEN` | For Turso | Authentication token for the Turso database. Omit the variable entirely for a local file; an empty value makes `drizzle-kit` fail. |
| `AUTH_SECRET` | Yes | Random secret used to sign admin session tokens. Without it, no administrator can sign in. |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical site origin without a trailing slash. Used for canonical URLs, the sitemap, Open Graph tags, and structured data. Must be `https://tarumanagara.org` in production. If unset, the code falls back to `https://www.tarumanagara.org`. |

Template:

```env
# Turso (libSQL)
#   turso db show <name> --url
#   turso db tokens create <name>
TURSO_DATABASE_URL=libsql://your-database-your-organisation.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Admin session signing secret. Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your-random-secret

# Canonical origin (production only)
NEXT_PUBLIC_SITE_URL=https://tarumanagara.org
```

### Separate databases per environment

Development and production use separate databases. Both files below are excluded from version control by `.gitignore` (`.env*`).

| File | Purpose |
| --- | --- |
| `.env.development.local` | Development database. Read by `next dev`, by `drizzle-kit` commands, and by the scripts in `scripts/` by default. |
| `.env.production.local` | Production database, for running database commands against production from a local machine. |

On Vercel, the same variables are configured in **Project Settings → Environment Variables**. Configure the Production and Preview environments separately, so that preview deployments never write to the production database.

---

## Database

### Schema

The schema is defined in `src/lib/db/schema.ts`.

| Table | Purpose |
| --- | --- |
| `news` | News articles: slug, title, content, author, caption, cover image reference, tags, category, display date, publication date, and published flag. |
| `news_categories` | Category tabs on `/berita`, with name, unique slug, and sort order. "Semua Berita" (all news) is not stored; it is always shown first. |
| `jobs` | Job vacancies: title, description, employment type, location, and open/closed status. |
| `applications` | Job applications submitted through the CV form, including the CV file stored as a BLOB. |
| `governance_members` | The governance roster on the About Us page: role, name, position, portrait, portrait crop position, sort order, and published flag. |
| `images` | Uploaded image bytes (news covers and portraits). Other tables store only a reference of the form `/api/images/<id>`. |
| `admin_users` | Administrator accounts: email, scrypt password hash, name, and role. |
| `login_attempts` | Failed sign-in counters used for brute-force protection. |

### Applying schema changes

```bash
npm run db:push        # apply the schema directly (default workflow)
npm run db:generate    # optional: generate SQL migration files in ./drizzle
npm run db:migrate     # optional: apply generated migration files
npm run db:studio      # browse the database in Drizzle Studio
```

### Targeting the production database

`drizzle-kit` reads `.env.development.local` unless `DOTENV_FILE` points elsewhere:

```powershell
# Windows PowerShell
$env:DOTENV_FILE=".env.production.local"; npm run db:push
```

```bash
# bash
DOTENV_FILE=.env.production.local npm run db:push
```

The Node.js scripts in `scripts/` accept a `--prod` flag instead:

```bash
npm run create-admin -- "admin@example.com" "a-strong-password" master --prod
```

### Maintenance scripts

The following scripts update databases created before a feature was introduced. Each is idempotent and can be run safely more than once. Append `-- --prod` to run against production.

| Command | Purpose |
| --- | --- |
| `npm run migrate:admin-role` | Adds the `role` column to `admin_users`. Existing accounts become `master`. |
| `npm run migrate:news-categories` | Adds the `news_categories` table and the `news.category_id` column. |
| `npm run migrate:job-types` | Renames legacy job types (`Fulltime`, `Parttime`) to `Full-Time` and `Part-Time`. Supports `--dry-run`. |

`migrate:news-categories` exists because `drizzle-kit push` does not create the `news_categories` unique index in the form it later expects, which makes subsequent pushes fail. Run this script before `db:push` on any database that predates news categories.

### Cloning the development database into production

To initialise an empty production database from the development database:

```bash
npm run db:clone -- --dry-run   # report what would be copied
npm run db:clone                # copy .env.development.local into .env.production.local
```

The script copies the schema exactly as it exists in the source database, together with every row of every table, including administrator accounts and their password hashes. It refuses to run if the target already contains tables (use `--force` to replace them) or if both files point to the same database, and it verifies row counts on completion. The target database must already exist. Other pairs of environment files can be selected with `--from <file> --to <file>`.

Because `db:clone` copies everything, it must not be used to give data to contributors. Use `db:export-sample` instead.

### Exporting sample content for contributors

```bash
npm run db:export-sample             # read the development database
npm run db:export-sample -- --prod   # read the production database
```

The script reads the source database without modifying it and writes a local SQLite file (`sample.db` by default; `--out <file>` and `--force` are supported). It recreates the full schema but copies rows only from an allow-list: news categories, job vacancies, published news, published governance members, and the images they reference. Administrator accounts, job applications, and login records are never copied, and a table added to the schema later stays empty until it is added to the allow-list in `scripts/export-sample-db.cjs`. See [SETUP.md, A3a](./SETUP.md#a3a-optional-starting-from-sample-content) for how a contributor uses the file.

---

## Authentication and Access Control

### Sessions

- Administrators sign in at `/admin/login` with an email address and password stored in `admin_users`.
- Passwords are hashed with scrypt using a random salt and compared in constant time.
- A successful sign-in sets the `admin_session` cookie, which contains a JWT signed with `AUTH_SECRET` (HS256). The cookie is `httpOnly`, `SameSite=Lax`, marked `Secure` in production, and expires after **7 days**.
- The token also carries a fingerprint of the account's password hash. `requireAdmin()` compares it with the database on every request, so **changing or resetting a password ends every other session of that account** immediately. The same happens when an account is re-created with `create-admin` or removed. A browser whose session has ended this way is sent to `/admin/sesi-berakhir`, which clears the cookie and opens the sign-in page.
- After **5 failed attempts** for the same email address, further attempts are refused for **15 minutes**. The counters are stored in the database so that the limit holds across Vercel's serverless instances.

### Roles

Roles are defined centrally in `src/lib/auth/roles.ts`.

| Role | Label | News | Governance | Job Vacancies | Applications |
| --- | --- | :-: | :-: | :-: | :-: |
| `master` | Admin Master | Yes | Yes | Yes | Yes |
| `hr` | HR | No | No | Yes | Yes |
| `humas` | Humas (Public Relations) | Yes | No | No | No |

The dashboard is available to every role, but shows only the sections that role may access.

Access is enforced at three levels:

1. **`src/proxy.ts`** redirects unauthenticated visitors to the sign-in page and redirects users away from sections their role does not own.
2. **`requireSection()`** in `src/lib/auth/guard.ts` re-checks the session and role inside every Server Action and in the CV download route. This is necessary because Server Actions are callable endpoints in their own right, independent of page navigation.
3. The panel's navigation shows only the sections available to the current role.

### Managing accounts

Passwords are managed in the panel under **Akun** (`/admin/akun`):

- Every administrator can change their own password. The current password is required, and the new one must be at least 8 characters.
- The Admin Master can also set a new password for any other account, for example when its owner has forgotten it or has left. This also lifts any sign-in lockout on that account.

Creating accounts, removing them, and changing roles are done from the command line:

```bash
npm run create-admin -- "<email>" "<password>" [master|hr|humas] [--prod]
```

Running the command for an existing email address resets that account's password and role. The default role is `master`.

---

## File and Image Storage

Turso is a database and does not provide object storage, so uploaded files are stored in the database itself.

| Upload | Accepted types | Maximum size | Storage |
| --- | --- | --- | --- |
| CV (application form) | PDF, DOC, DOCX | 5 MB | BLOB in `applications.cv_data` |
| News cover, governance portrait | JPEG, PNG, WebP | 5 MB | BLOB in the `images` table |

- **Images** are resized in the browser before upload (longest edge 1920 px for news covers and 1665 px for portraits). This keeps Server Action request bodies small; Next.js is configured to accept up to 4 MB per request (`next.config.ts`), below Vercel's 4.5 MB limit.
- **Image delivery:** `/api/images/[id]` serves stored images with a one-year `immutable` cache header. Image rows are never modified; replacing an image creates a new row with a new identifier, so a URL can never serve outdated content.
- **CV downloads** go through `/admin/lamaran/cv/[id]`, which is restricted to roles with access to applications.
- **Validation** of file type and size is always performed on the server, regardless of client-side checks.

---

## Caching and Revalidation

The public data queries in `src/lib/data/` are wrapped in Next.js `unstable_cache` and labelled with the cache tags defined in `src/lib/cache.ts` (`news`, `jobs`, and `governance`). The admin panel's list of job applications is read directly from the database and is not cached.

- Cached data and rendered pages are kept until an administrator changes the underlying content. Every administrative write in `src/app/admin/actions.ts` calls `updateTag(...)`, which invalidates both the cached query and every page that used it.
- No time-based revalidation is configured. Periodic regeneration would only reproduce identical pages and would incur additional ISR writes on Vercel.
- Article pages are pre-rendered at build time through `generateStaticParams`. Articles published after a deployment are rendered on their first visit.

---

## Static Content

Some content is defined in code rather than in the database, and changing it requires a code change and a new deployment. Most of it is located in `src/lib/site.ts`:

| Export | Content |
| --- | --- |
| `siteConfig` | Site name, tagline, description, address, office location, operating hours, telephone number, email address, social media links, and the "Daftar Untar" link. |
| `navLinks` | Main navigation menu items. |
| `units` | Business units shown on the home page, with their images, locations, and websites. The footer's "Ekosistem" links are derived from this list. |
| `mapLinks` | Google Maps links for each campus and site. |

---

## Search Engine Optimisation

- **Metadata:** each public page defines its own title, description, canonical URL, and Open Graph and Twitter card data through `pageMetadata()` in `src/lib/seo.ts`. Site-wide defaults are set in `src/app/layout.tsx`.
- **Sitemap:** `/sitemap.xml` (`src/app/sitemap.ts`) lists the static pages and every published article.
- **Robots:** `/robots.txt` (`src/app/robots.ts`) allows all public pages, excludes `/admin`, and references the sitemap.
- **Structured data:** the home page publishes `WebSite` and `Organization` JSON-LD, which Google uses to display the site name in search results. Each article publishes `NewsArticle` JSON-LD.
- **Favicons:** the complete favicon set in `public/favicon/` is generated from `scripts/assets/logo-mark.png` with `npm run favicons`. The script uses `sharp`, which is installed as part of the Next.js dependency tree.

---

## Project Structure

```text
.
├── public/                     Static assets (images, favicon set, web manifest)
├── scripts/                    Database, account, and favicon maintenance scripts
│   └── assets/                 Source artwork for the favicon generator
├── src/
│   ├── app/
│   │   ├── (public)/           Public website (home, about, careers, news)
│   │   ├── admin/
│   │   │   ├── (panel)/        Authenticated admin sections
│   │   │   ├── login/          Sign-in page
│   │   │   ├── actions.ts      Server Actions for content management
│   │   │   └── auth-actions.ts Sign-in, sign-out, and login throttling
│   │   ├── api/images/[id]/    Image delivery route
│   │   ├── fonts/              Self-hosted Plus Jakarta Sans files
│   │   ├── layout.tsx          Root layout and site-wide metadata
│   │   ├── globals.css         Tailwind CSS v4 theme tokens and utilities
│   │   ├── robots.ts           robots.txt
│   │   └── sitemap.ts          sitemap.xml
│   ├── components/
│   │   ├── layout/             Navbar and footer
│   │   ├── sections/           Page sections (hero, welcome card, unit selector)
│   │   ├── motion/             Scroll-reveal animation wrapper
│   │   └── ui/                 shadcn/ui components
│   ├── lib/
│   │   ├── auth/               Password hashing, sessions, roles, guards
│   │   ├── data/               Cached public data queries
│   │   ├── db/                 Drizzle client and schema
│   │   ├── validators/         Zod schemas and upload limits
│   │   ├── cache.ts            Cache tag definitions
│   │   ├── seo.ts              Per-page metadata helper
│   │   └── site.ts             Static site content and configuration
│   └── proxy.ts                Route protection for /admin
├── drizzle.config.ts           drizzle-kit configuration
└── next.config.ts              Next.js configuration
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run db:push` | Apply the Drizzle schema to the database. |
| `npm run db:generate` | Generate SQL migration files. |
| `npm run db:migrate` | Apply generated migration files. |
| `npm run db:studio` | Open Drizzle Studio. |
| `npm run db:clone` | Copy one database into another (schema and all rows). |
| `npm run db:export-sample [-- --prod]` | Export public content (no accounts, applications, or CVs) into a local SQLite file for contributors. |
| `npm run create-admin -- "<email>" "<password>" [role] [--prod]` | Create an administrator, or reset an existing administrator's password and role. |
| `npm run migrate:admin-role` | Add the RBAC `role` column to older databases. |
| `npm run migrate:news-categories` | Add news categories to older databases. |
| `npm run migrate:job-types` | Rename legacy job type values. |
| `npm run favicons` | Regenerate the favicon set. |

---

## Deployment

The site is deployed on Vercel, which builds and deploys automatically on every push.

| Branch | Environment | Address |
| --- | --- | --- |
| `prod` | Production | <https://tarumanagara.org> |
| `dev` | Preview | <https://tarumanagarafoundation-preview.vercel.app> |

### Release procedure

The `prod` branch is protected by a GitHub ruleset: changes require a reviewed pull request, and only the repository owner can bypass that rule. Contributors open pull requests into `dev`, as described in [SETUP.md, A9](./SETUP.md#a9-submitting-changes). The owner releases as follows:

1. Commit changes to `dev` (or merge a reviewed pull request into it) and push. Vercel deploys them to the preview address.
2. Review the changes on the preview deployment.
3. Promote the same commits to production by fast-forwarding `prod`:

   ```bash
   git push origin dev:prod
   ```

4. Confirm the production deployment at <https://tarumanagara.org>.

> **Schema changes must reach the production database before the code that depends on them.** Run `db:push`, or the relevant `migrate:*` script, against production first, and only then push to `prod`. Deploying code that expects a column or table which does not yet exist will cause runtime errors.

### First-time setup on Vercel

1. Import the GitHub repository into Vercel. The Next.js framework preset is detected automatically.
2. Set the production branch to `prod`.
3. Add `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`, and `NEXT_PUBLIC_SITE_URL` for the Production environment, and the development database credentials for the Preview environment.
4. Add the custom domains as described in the next section.

---

## Domain, DNS, and Search Console

The DNS zone for `tarumanagara.org` is managed at **Jagoan Hosting** (nameservers `ns1.jagoanhosting.com` and `ns2.jagoanhosting.com`). The domain is added to the Vercel project as follows:

| Domain | Configuration |
| --- | --- |
| `tarumanagara.org` | Production domain, served by Vercel. |
| `www.tarumanagara.org` | Permanent redirect (308) to `tarumanagara.org`. |

Relevant DNS records:

| Type | Name | Points to | Purpose |
| --- | --- | --- | --- |
| A | `tarumanagara.org` | Vercel | Website |
| CNAME | `www` | Vercel | Redirect to the apex domain |
| MX, A (`mail`, `ftp`) | various | Jagoan Hosting server | Email for `@tarumanagara.org` addresses |
| TXT | `tarumanagara.org` | `google-site-verification=...` | Google Search Console ownership verification |

> The MX record and the `mail` record serve the foundation's email. Do not change or delete them when editing the website's records. The Google verification TXT record must also remain in place; removing it revokes Search Console access.
>
> When adding a record whose name is the domain itself in the Jagoan Hosting panel, enter the name with a trailing dot (`tarumanagara.org.`) or as `@`. Without the trailing dot, the panel appends the domain again, producing `tarumanagara.org.tarumanagara.org`.

**Google Search Console** is configured as a Domain property for `tarumanagara.org`, with `https://tarumanagara.org/sitemap.xml` submitted. After significant content or metadata changes, use **URL Inspection → Request Indexing** to ask Google to re-crawl the affected pages.

---

## Security Considerations

- Database credentials and the session secret are used only on the server. The database client, the data-query modules, password hashing, and the authorisation guard import `server-only`, which makes the build fail if any of them is imported into client code.
- Every administrative Server Action verifies the session and the caller's role, independently of the page-level checks in `src/proxy.ts`.
- Uploaded files are validated on the server for type and size before they are stored.
- `/admin` is excluded from search engine crawling through `robots.txt`.
- Secrets must never be committed. All `.env*` files are excluded by `.gitignore`.

---

## Troubleshooting

| Symptom | Likely cause and resolution |
| --- | --- |
| No administrator can sign in, although the credentials are correct. | `AUTH_SECRET` is missing in that environment. Set it and redeploy. |
| Sign-in reports that too many attempts have been made. | The 15-minute lockout is active for that email address. Wait for it to expire, or delete the corresponding row from `login_attempts`. |
| Saving a news article or portrait fails with a generic server error. | The request exceeded the 4 MB Server Action limit. Images are normally resized automatically; retry with a smaller source image. |
| `npm run db:push` fails while dropping `news_categories_slug_unique`. | The database predates news categories. Run `npm run migrate:news-categories`, then run `db:push` again. |
| The site works locally but fails in production after a release. | A schema change was not applied to the production database. See the warning under [Deployment](#deployment). |

---

## Notes for Contributors

- This project uses **Next.js 16**, which introduces breaking changes compared with earlier versions. Among others, the `middleware` file convention has been renamed to `proxy` (see `src/proxy.ts`). Consult the documentation bundled in `node_modules/next/dist/docs/` before relying on conventions from earlier versions.
- Next.js 16 requires every `quality` value passed to `next/image` to be listed in `images.qualities` in `next.config.ts`. Unlisted values are silently replaced with the nearest permitted value.
- Use the existing helpers when adding features: `pageMetadata()` for page metadata, `requireSection()` for authorisation in Server Actions, `unstable_cache` with a tag from `CACHE_TAGS` for public reads, and `updateTag()` after every write.
