# Plan 005: Triage vulnerable dependencies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise.
>
> **Drift check (run first)**: `git diff --stat bca6540..HEAD -- package.json bun.lock plans/README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-add-check-script.md`
- **Category**: security
- **Planned at**: commit `bca6540`, 2026-06-16

## Why this matters

`bun audit` reports high advisories through the Astro, Vercel, Vite, and
related build/deploy dependency graph. Many are build-time or development-server
exposures rather than direct app runtime flaws, but the project deploys with
Vercel and should not carry known high advisories without a conscious decision.

## Current state

- Core dependencies include:

```json
"astro": "^6.3.0",
"@astrojs/vercel": "^10.0.6",
"@astrojs/react": "^5.0.4",
"@tailwindcss/vite": "^4.2.4",
"vercel": "^53.2.0"
```

- `bun audit` at planning time reported 25 vulnerabilities, including high advisories under `tar`, `vite`, `undici`, `minimatch`, `form-data`, and `esbuild`.
- Existing override:

```json
"overrides": {
  "path-to-regexp": "6.3.0"
}
```

- Project verification gates are `bun run check` and `bun run build`; if Plan 002 has landed, also run `bun run test`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Audit | `bun audit` | ideally exits 0; otherwise only accepted advisories remain documented |
| Update compatible | `bun update` | exits 0 |
| Check | `bun run check` | exits 0 |
| Test | `bun run test` | exits 0 if the script exists |
| Build | `bun run build` | exits 0 |

## Scope

**In scope**:
- `package.json`
- `bun.lock`
- `plans/README.md`

**Out of scope**:
- Application source changes to adapt to major framework migrations.
- Replacing Astro, Vercel, React, or Tailwind.
- Removing the existing `path-to-regexp` override unless audit/update proves it is obsolete and gates pass.

## Git workflow

- Branch suggestion: `codex/005-triage-vulnerable-dependencies`
- Commit message style: short imperative, for example `Update vulnerable dependencies`
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Capture the baseline audit

Run `bun audit` and save the important package/advisory names in your notes. Do not paste secret values or `.env` contents if the tool mentions files.

**Verify**: `bun audit` -> reproduces advisories or exits 0 if already fixed.

### Step 2: Try compatible updates first

Run `bun update` to update within declared semver ranges. Review `package.json` and `bun.lock`.

**Verify**: `git diff -- package.json bun.lock` -> only dependency/lockfile changes are present.

### Step 3: Re-run audit and decide if compatible updates are enough

Run `bun audit` again.

- If high advisories are gone, continue to Step 5.
- If high advisories remain under packages that can be resolved by safe minor/patch direct dependency bumps, update only those direct dependencies.
- If high advisories require major framework or adapter upgrades, STOP and report with the remaining advisory names and required package ranges instead of doing a broad migration.

**Verify**: `bun audit` -> exits 0, or remaining advisories are documented as blocked by major upgrade requirements.

### Step 4: Avoid risky override sprawl

Do not add broad transitive overrides unless one targeted override removes a high advisory and all gates pass. If a new override is needed, document in `package.json` via the package name only; do not include advisory exploit details.

**Verify**: `bun audit` and `bun run check` -> both pass or remaining issues are documented.

### Step 5: Run full gates and update index

Run `bun run test` if it exists, then `bun run check`, `bun run build`, and final `bun audit`.

**Verify**:

- `bun run check` -> exits 0
- `bun run build` -> exits 0
- `bun run test` -> exits 0 if available
- `bun audit` -> exits 0, or this plan is marked `BLOCKED` with one-line reason in `plans/README.md`

## Test plan

This is dependency triage. Use existing automated gates. If Plan 002 has landed, run the test suite.

## Done criteria

- [ ] Compatible dependency updates have been applied.
- [ ] `bun audit` exits 0, or remaining high advisories are explicitly blocked by major framework/adapter upgrades and the plan is marked `BLOCKED`.
- [ ] `bun run check` exits 0.
- [ ] `bun run build` exits 0.
- [ ] `bun run test` exits 0 if available.
- [ ] No files outside the in-scope list are modified.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report if:

- Fixing advisories requires an Astro/Vercel/Vite major migration.
- `bun update` causes unexpected non-dependency source changes.
- Build output changes reveal a framework incompatibility that requires application source edits.

## Maintenance notes

Keep this plan narrow. If a major upgrade is needed, write a separate migration plan with changelog review, code changes, and visual verification.
