# Claude Code – Projektregler

## Deployment-flow

Dette projekt deployer automatisk via Vercel ved push/merge til `main`.

### Regler
- **Claude må IKKE merge en PR til `main` uden eksplicit godkendelse fra brugeren.**
- Arbejd altid på en feature-branch, ikke direkte på `main`.
- Push til en branch → Vercel opretter automatisk en preview-URL med dev-databasen.
- Brugeren godkender preview → merger selv PR'en → prod deployer.

### Miljøer
| Miljø | Database | Trigger |
|-------|----------|---------|
| Production | Vercel Postgres (prod) | Merge til `main` |
| Preview | Vercel Postgres (dev/scratch) | Push til hvilken som helst branch |
| Development | Vercel Postgres (dev/scratch) | Lokalt |
