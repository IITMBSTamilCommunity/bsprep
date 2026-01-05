Running SQL migrations for BSPrep

Use one of these options to apply the SQL files in `./scripts` to your Supabase/Postgres database.

1) Using the Supabase web SQL editor (recommended for quick runs)
- Open your Supabase project dashboard
- Go to SQL Editor → New query
- Copy & paste the SQL from each file in order and run them:
  - `scripts/008_add_role_to_profiles.sql`
  - `scripts/009_create_notes_table.sql`
  - `scripts/010_notes_rls.sql`
  - `scripts/011_admin_policies.sql`
  - `scripts/012_create_quiz_tables.sql`
  - `scripts/013_leaderboard_rpc.sql`
  - `scripts/014_create_videos_table.sql`
  - `scripts/015_add_premium_flag.sql`
  - `scripts/016_create_payments_table.sql`

2) Using the Supabase CLI
- Install: https://supabase.com/docs/guides/cli
- Authenticate and link to your project
- Run each script:

```bash
supabase db query "$(cat scripts/008_add_role_to_profiles.sql)"
supabase db query "$(cat scripts/009_create_notes_table.sql)"
supabase db query "$(cat scripts/010_notes_rls.sql)"
```

3) Using `psql` with a Postgres connection string
- Export your database URL (Supabase provides this in Project → Settings → Database → Connection string)

```bash
export DATABASE_URL="postgres://<user>:<pass>@<host>:5432/<db>?sslmode=require"
psql "$DATABASE_URL" -f scripts/008_add_role_to_profiles.sql
psql "$DATABASE_URL" -f scripts/009_create_notes_table.sql
psql "$DATABASE_URL" -f scripts/010_notes_rls.sql
psql "$DATABASE_URL" -f scripts/011_admin_policies.sql
psql "$DATABASE_URL" -f scripts/012_create_quiz_tables.sql
psql "$DATABASE_URL" -f scripts/013_leaderboard_rpc.sql
psql "$DATABASE_URL" -f scripts/014_create_videos_table.sql
psql "$DATABASE_URL" -f scripts/015_add_premium_flag.sql
psql "$DATABASE_URL" -f scripts/016_create_payments_table.sql
```

Notes & next steps
- After running migrations, verify the `user_profiles_extended` table has `email` and `role` columns and `notes` table exists.
- RLS: the SQL creates basic policies; admin access is enforced via server APIs that check `user_profiles_extended.role = 'admin'`.
- If you want DB-level admin policies, run the commented example in `scripts/010_notes_rls.sql` after creating `user_profiles_extended` role values.
- If you want, I can prepare a single combined migration file and a small script to run them in order.
