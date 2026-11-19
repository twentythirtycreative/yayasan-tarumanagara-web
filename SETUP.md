# Setup and Operations Guide

This guide provides step-by-step procedures for setting up the Yayasan Tarumanagara website in a new environment and for carrying out routine operational tasks.

For a reference description of the architecture, database schema, access control, and configuration, see [README.md](./README.md).

---

## Contents

- [Part A. Local Development Environment](#part-a-local-development-environment)
- [Part B. Production Environment](#part-b-production-environment)
- [Part C. Routine Procedures](#part-c-routine-procedures)

---

## Part A. Local Development Environment

### A1. Prerequisites

Ensure the following are available:

- Node.js 20.9 or later (`node -v`)
- npm
- Git, with access to the GitHub repository
- Only if you choose a Turso database in step A3: a Turso account, and optionally the [Turso CLI](https://docs.turso.tech/cli/installation)

### A2. Clone the repository and install dependencies

```bash
git clone https://github.com/twentythirtycreative/yayasan-tarumanagara-web.git
cd yayasan-tarumanagara-web
git checkout dev
npm install
```

Day-to-day work starts from the `dev` branch. See [A9. Submitting changes](#a9-submitting-changes).

### A3. Choose a development database

Never use the production database for local development. Choose one of the following options.

**Option 1: local SQLite file (recommended for contributors).** The database is a file on your own machine. No account or credentials are required, and nothing you do affects any shared database. The file `local.db` is excluded from Git by `.gitignore`. It starts empty, unless the repository owner provides a sample file (see [A3a](#a3a-optional-starting-from-sample-content)).

**Option 2: Turso database.** Use this when the development database must be reachable from more than one machine or shared with the deployed preview environment.

```bash
turso auth login
turso db create yayasan-tarumanagara-dev
turso db show yayasan-tarumanagara-dev --url      # copy the libsql:// URL
turso db tokens create yayasan-tarumanagara-dev   # copy the token
```

The same can be done in the Turso dashboard: create the database, then copy its URL and generate a token from the database page.

### A3a. Optional: starting from sample content

An empty local database shows a site without news, vacancies, or governance members. To start from realistic content, the repository owner exports the public content of a Turso database into a SQLite file:

```bash
npm run db:export-sample                 # from the development database
npm run db:export-sample -- --prod       # or from the production database
```

The script writes `sample.db` (use `--out <file>` for another name and `--force` to overwrite). It only reads from the source database. It copies the full schema, but rows only from an allow-list: news categories, job vacancies, published news, published governance members, and the images those rows use. **Administrator accounts, job applications (applicants' personal data and CVs), and login records are never copied**; those tables are created empty.

The contributor saves the file as `local.db` in the project root and continues with Option 1 below. Because the file contains no administrator accounts, step A6 is still required.

> Next.js keeps a data cache in `.next/`. After replacing `local.db` with a different file, delete the `.next` folder before running `npm run dev`; otherwise pages may keep showing the previous database's content.

### A4. Create the environment file

Create `.env.development.local` in the project root.

For **Option 1** (local SQLite file):

```env
TURSO_DATABASE_URL=file:local.db
AUTH_SECRET=<random secret>
```

Leave out `TURSO_AUTH_TOKEN` entirely. A line with an empty value (`TURSO_AUTH_TOKEN=`) makes `npm run db:push` fail with "Please provide required params for 'turso' dialect".

For **Option 2** (Turso database):

```env
TURSO_DATABASE_URL=libsql://yayasan-tarumanagara-dev-<organisation>.turso.io
TURSO_AUTH_TOKEN=<token from step A3>
AUTH_SECRET=<random secret>
```

Generate a value for `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This file is excluded from Git by `.gitignore` and must never be committed.

### A5. Create the database tables

```bash
npm run db:push
```

`drizzle-kit` compares the schema in `src/lib/db/schema.ts` with the database and creates the missing tables. If it asks for confirmation, for example because a change could cause data loss, read the proposed statements carefully before accepting.

### A6. Create an administrator account

```bash
npm run create-admin -- "your.name@example.com" "a-strong-password" master
```

The available roles are `master` (all sections), `hr` (job vacancies and applications), and `humas` (news). The password is passed on the command line and therefore remains in your shell history; clear the history entry afterwards if the machine is shared.

### A7. Start the development server

```bash
npm run dev
```

### A8. Verify the installation

| Check | Expected result |
| --- | --- |
| Open <http://localhost:3000> | The home page loads without errors. The news section is empty until articles are published. |
| Open <http://localhost:3000/admin> | You are redirected to `/admin/login`. |
| Sign in with the account from step A6 | The dashboard is displayed. |
| Create and publish a test article in **Berita & Kegiatan** | The article appears on <http://localhost:3000/berita>. |
| Submit a test application at <http://localhost:3000/karir/kirim-cv> | The application appears under **Lamaran**, and the CV can be downloaded. |

Remove the test data afterwards if it is not needed. With a local SQLite file, you can also start over at any time by deleting `local.db` (or replacing it with a fresh sample file) and the `.next` folder, then repeating steps A5 and A6.

### A9. Submitting changes

The `prod` branch is protected: changes reach production only after the repository owner has reviewed them. Contributors work on their own branch and propose changes through a pull request into `dev`.

1. Start from the latest `dev`:

   ```bash
   git checkout dev
   git pull
   git checkout -b <short-description-of-the-change>
   ```

2. Make and commit your changes. Before pushing, run:

   ```bash
   npx tsc --noEmit
   npm run lint
   ```

   Neither command should report new errors compared with `dev`.

3. Push the branch and open a pull request into **`dev`** on GitHub:

   ```bash
   git push -u origin <short-description-of-the-change>
   ```

4. Describe what changed and how you tested it. If the change touches `src/lib/db/schema.ts` or anything else that requires a database change, say so explicitly in the pull request: the repository owner applies database changes to production separately (see [C2](#c2-changing-the-database-schema)).

Contributors do not need, and should not be given, production credentials. Do not run any script with the `--prod` flag.

---

## Part B. Production Environment

Follow this part only when building the production environment from the beginning, for example when moving to a new Vercel account or a new database. The current production environment is already configured as described here.

### B1. Create the production database

```bash
turso db create yayasan-tarumanagara-prod
turso db show yayasan-tarumanagara-prod --url
turso db tokens create yayasan-tarumanagara-prod
```

Create `.env.production.local` in the project root with the production values:

```env
TURSO_DATABASE_URL=libsql://yayasan-tarumanagara-prod-<organisation>.turso.io
TURSO_AUTH_TOKEN=<production token>
AUTH_SECRET=<a different random secret from development>
NEXT_PUBLIC_SITE_URL=https://tarumanagara.org
```

### B2. Populate the production database

Choose one of the following options.

**Option 1: copy the development database.** Use this when the development database already holds the content that should go live. Everything is copied, including administrator accounts and their passwords.

```bash
npm run db:clone -- --dry-run   # review what will be copied
npm run db:clone
```

The script refuses to overwrite a database that already contains tables unless `--force` is given.

**Option 2: start with an empty database.**

```powershell
# Windows PowerShell
$env:DOTENV_FILE=".env.production.local"; npm run db:push
```

```bash
# bash
DOTENV_FILE=.env.production.local npm run db:push
```

Then create the first administrator in production:

```bash
npm run create-admin -- "admin@example.com" "a-strong-password" master --prod
```

### B3. Create the Vercel project

1. In Vercel, select **Add New → Project** and import the GitHub repository. The Next.js preset is detected automatically.
2. Under **Settings → Git**, set the **Production Branch** to `prod`.
3. Under **Settings → Environment Variables**, add:

   | Variable | Production | Preview |
   | --- | --- | --- |
   | `TURSO_DATABASE_URL` | Production database URL | Development database URL |
   | `TURSO_AUTH_TOKEN` | Production token | Development token |
   | `AUTH_SECRET` | Production secret | Development secret |
   | `NEXT_PUBLIC_SITE_URL` | `https://tarumanagara.org` | Not set |

   Keeping the Preview environment on the development database ensures that testing on preview deployments never alters production data.

4. Push to `prod` to trigger the first production deployment.

### B4. Configure the domains in Vercel

In **Settings → Domains**:

1. Add `tarumanagara.org` and connect it to the **Production** environment.
2. Add `www.tarumanagara.org`, choose **Redirect to Another Domain**, set the target to `tarumanagara.org`, and select **308 Permanent Redirect**.

   > Clear the **Include apex and www variants** checkbox before saving. If it is left selected, the setting is also applied to `tarumanagara.org`, which would then redirect to itself and take the site offline.

3. Optionally, add a `*.vercel.app` domain for previews and connect it to the `dev` branch. The current preview address is <https://tarumanagarafoundation-preview.vercel.app>.

Vercel shows, for each domain, the DNS record it expects. Leave this page open for the next step.

### B5. Configure DNS at Jagoan Hosting

The DNS zone for `tarumanagara.org` is managed in the Jagoan Hosting member area, under the DNS records page for the domain.

1. Set the records Vercel requested in step B4. The values in use as of November 2026 are:

   | Type | Name | Content |
   | --- | --- | --- |
   | A | `tarumanagara.org.` | `216.198.79.1` |
   | CNAME | `www.tarumanagara.org.` | `bdc4554a729f4657.vercel-dns-017.com` |

   If Vercel displays different values, use the values shown by Vercel.

2. Save each record with the **Save** button on its own row.
3. Return to Vercel and select **Refresh** on each domain until it shows **Valid Configuration**. Vercel issues the SSL certificates automatically once the records resolve. This can take up to the record's TTL (currently 4 hours).

> Do not modify the `MX` record or the `mail` and `ftp` records. They deliver email for `@tarumanagara.org` addresses, which is hosted separately at Jagoan Hosting.
>
> Do not use **Reset DNS Zone**. It deletes every record, including those used for email.

### B6. Set up Google Search Console

1. In [Google Search Console](https://search.google.com/search-console), add a **Domain** property for `tarumanagara.org`.
2. Copy the TXT record Google provides, using the **Copy** button.
3. In Jagoan Hosting, add a new record:

   | Type | Name | Content |
   | --- | --- | --- |
   | TXT | `tarumanagara.org.` | `google-site-verification=...` (the copied value) |

   > Enter the name with the trailing dot, or as `@`. The panel treats a name without a trailing dot as a subdomain and saves it as `tarumanagara.org.tarumanagara.org`, which Google cannot find.

4. Wait a few minutes, then select **Verify** in Search Console. Keep the TXT record permanently; removing it revokes verification.
5. Open **Sitemaps** and submit the full URL `https://tarumanagara.org/sitemap.xml`. For a Domain property, the full URL is required; entering only `sitemap.xml` is rejected as an invalid address.
6. Open **URL Inspection**, enter `https://tarumanagara.org/`, and select **Request Indexing**.

### B7. Verify the production environment

| Check | Expected result |
| --- | --- |
| Open <https://tarumanagara.org> | The site loads over HTTPS without a certificate warning. |
| Open <https://www.tarumanagara.org> | The browser is redirected to `https://tarumanagara.org/`. |
| Open <https://tarumanagara.org/sitemap.xml> | An XML sitemap listing the public pages and published articles is returned. All addresses begin with `https://tarumanagara.org`. |
| Open <https://tarumanagara.org/robots.txt> | `/admin` is disallowed and the sitemap is referenced. |
| Sign in at <https://tarumanagara.org/admin> | The dashboard is displayed. |
| View the source of the home page | The `<title>`, canonical link, and JSON-LD block refer to `https://tarumanagara.org`. If they refer to `www.tarumanagara.org`, `NEXT_PUBLIC_SITE_URL` is missing in Vercel. |

---

## Part C. Routine Procedures

### C1. Releasing changes

This procedure is for the repository owner, who is on the bypass list of the `prod` ruleset. Contributors' pull requests are reviewed and merged into `dev` first.

1. Work on the `dev` branch (or merge a reviewed pull request into it), commit, and push:

   ```bash
   git push origin dev
   ```

2. Wait for the Vercel preview deployment and review the changes at the preview address.
3. If the release includes a database schema change, apply it to production first (see [C2](#c2-changing-the-database-schema)).
4. Promote the release by fast-forwarding `prod` to `dev`:

   ```bash
   git push origin dev:prod
   ```

   If Git rejects the push as a non-fast-forward, `prod` contains commits that `dev` does not. Merge `prod` into `dev`, review the result, and repeat this step.

5. Confirm the production deployment in Vercel and on <https://tarumanagara.org>.

### C2. Changing the database schema

1. Edit `src/lib/db/schema.ts`.
2. Apply the change to the development database and test it locally:

   ```bash
   npm run db:push
   ```

3. Before releasing, apply the same change to production:

   ```powershell
   $env:DOTENV_FILE=".env.production.local"; npm run db:push
   ```

4. Only then push the code to `prod`.

Code that expects a table or column which does not yet exist in production will fail at runtime. For this reason, schema changes should be additive where possible (new tables, or new columns with default values), so that the code currently in production continues to work with the updated database.

### C3. Upgrading an older database

A database created before certain features were introduced needs the following steps, in this order. Each script is idempotent and leaves an up-to-date database unchanged. Append `-- --prod` to target production.

```bash
npm run migrate:admin-role         # adds admin_users.role
npm run migrate:news-categories    # adds news_categories and news.category_id
npm run db:push                    # adds any remaining tables and columns
npm run migrate:job-types          # renames legacy job type values
```

`migrate:news-categories` must run before `db:push`; otherwise `db:push` can fail on the `news_categories_slug_unique` index.

### C4. Managing administrator accounts

| Task | Procedure |
| --- | --- |
| Change your own password | In the panel, open **Akun** and fill in **Ganti Kata Sandi**. Your other sessions are signed out. |
| Reset another account's password | Signed in as Admin Master, open **Akun** and use **Atur Ulang Kata Sandi Akun Lain**. All sessions of that account are signed out and its sign-in lockout is lifted. Give the new password to the account owner in person. |
| Reset the Admin Master password | If no one can sign in as Admin Master, run `npm run create-admin -- "<email>" "<new password>" master --prod`. |
| Create an account | `npm run create-admin -- "<email>" "<password>" <role> [--prod]` |
| Change a role | Run the same command with the new role. A password must also be supplied, and it replaces the current one. |
| Remove an account | Open `npm run db:studio` against the relevant database and delete the row from `admin_users`. Its sessions end immediately. |
| Lift a sign-in lockout | Wait 15 minutes, reset the account's password from **Akun**, or delete the row for that email address from `login_attempts` in Drizzle Studio. |

Email addresses are stored in lower case. To open Drizzle Studio against production, set `DOTENV_FILE=.env.production.local` first, as in [C2](#c2-changing-the-database-schema).

### C5. Rotating secrets

**`AUTH_SECRET`**

1. Generate a new value (see [A4](#a4-create-the-environment-file)).
2. Replace it in Vercel for the relevant environment, and in the corresponding local environment file.
3. Redeploy. Environment variable changes take effect only on a new deployment.

All administrators are signed out and must sign in again.

**Turso token**

1. Create a new token with `turso db tokens create <database>`.
2. Replace `TURSO_AUTH_TOKEN` in Vercel and in the local environment file, then redeploy.
3. Once the new deployment is confirmed to work, invalidate the old tokens in the Turso dashboard or with `turso db tokens invalidate <database>`. This command invalidates every existing token for the database, so complete steps 1 and 2 first.

### C6. Regenerating the favicons

1. Replace `scripts/assets/logo-mark.png` with the new mark: a white mark on a transparent background, 1024 × 1024 pixels.
2. Run:

   ```bash
   npm run favicons
   ```

3. Review the generated files in `public/favicon/` and `src/app/favicon.ico`, then commit and release them.

Search engines refresh favicons on their own schedule, which can take several weeks.

### C7. Requesting re-indexing after content changes

Search engines discover new and updated articles through the sitemap. For important changes, such as a new page or revised page titles, request re-indexing in Google Search Console: **URL Inspection → enter the page URL → Request Indexing**. Google allows approximately ten such requests per property per day.
