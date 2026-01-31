# Security & Repo Audit

## A) Secrets / key exposure

### Patterns searched
- SUPABASE_SERVICE_ROLE_KEY
- service_role / SERVICE_ROLE
- BEGIN PRIVATE KEY / PRIVATE_KEY
- AWS_SECRET / API_SECRET
- STRIPE_SECRET
- sk_live / rk_live
- JWT-like tokens ("eyJ...")

### Findings
- No secret patterns found in tracked source files.
- `.env` is present locally but is **ignored** by `.gitignore` and is **not tracked** by git.

### Remediation changes
- No secret removals were needed.
- No frontend env access was using non-`VITE_` variables.

## Notes
- If any secrets were ever committed historically, rotate them and consider git history rewrite.
