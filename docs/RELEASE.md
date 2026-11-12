# Release: Vercel and azwarism.com

## Current boundary

The initial inspection found only the master plan. During implementation an owner repository became available: `https://github.com/azwar-ml/azwar.git`, branch `main`. Read access and dry-run push were verified. No Vercel project credential or registrar access was available, and no deployment or domain connection has been performed. No secrets are needed to run the app. Hosting may have its own access/request logs, described on the privacy page.

## Prepare a reviewable preview

From this directory:

```powershell
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

For the detected existing repository, review and commit local changes if needed, then push to its configured origin:

```powershell
git status
git add .
git commit -m "Build AZWARISM UNIVERSE"
git push -u origin main
```

Do not include `.env`, `.vercel`, node_modules, caches or browser artifacts; `.gitignore` excludes them. Review `git diff --cached` before committing. If this implementation has already been pushed, skip the commit/push commands. Do not reinitialize or replace the existing origin.

1. Sign in to the authorized Vercel account. Add New → Project → import the repository. Root directory is the repository root, framework is **Next.js**, install is `npm ci`, build is `npm run build`, output directory uses the framework default. Use a Vercel-supported Node 24 LTS runtime compatible with package engines. No environment variables are required.
2. First review the generated `*.vercel.app` deployment. For subsequent changes use a branch/PR Preview Deployment before promotion. Do not switch DNS until preview QA passes.
3. Test all fourteen public content routes, unknown routes, saves/reload/export/delete, keyboard navigation, sound opt-in, reduced motion, browser console, slow-network startup and the real-device checklist in QA_MATRIX.
4. Keep the tested commit SHA and deployment URL in the release record. Promote the tested version to production when ready.

## Connect the domain safely — owner action

1. Confirm ownership of `azwarism.com` in the registrar. In the intended Vercel project go to **Settings → Domains**, add `azwarism.com` and optionally `www.azwarism.com`.
2. Follow the actual verification and DNS records shown for that project. Copy **exact names, types and values** from Vercel into the registrar. Records can be project-specific. This document intentionally supplies no guessed A address or CNAME target.
3. Preserve existing MX, mail verification, TXT and other service records. Avoid switching nameservers just to host the website unless all existing records have been inventoried and migrated.
4. The app's canonical URL is `https://azwarism.com`. Configure `www` to redirect to the apex in Vercel. If choosing `www` instead, update metadataBase, sitemap, robots sitemap URL and canonical references first.
5. Wait for Vercel to report valid configuration and issue HTTPS. Verify both domain variants, redirect direction, certificates, route responses, social PNG, icon and canonical tags. Run post-deployment QA against the real HTTPS URL. Until verified, report the domain as pending.

Use Vercel's current [domain setup instructions](https://vercel.com/docs/domains/working-with-domains/add-a-domain) and [domain redirect instructions](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting). Checked November 12, 2026; follow the actual project dashboard for values and current UI.

## Rollback

Retain the previous healthy deployment and its commit. If production regresses, use the project's Deployments controls to restore/promote the previous healthy deployment; verify the domain again. See [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment). Browser-local schema version 1 remains compatible with this release. Do not clear user data as a deployment step.

## CI

The repository workflow runs install, lint, typecheck, unit tests, production build and Chromium E2E on pull requests and pushes. It needs no secrets and does not deploy. A passing CI run and a preview check are release prerequisites, not proof of domain readiness.
