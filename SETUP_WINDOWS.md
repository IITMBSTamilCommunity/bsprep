# BSPrep — Windows Setup (Local Dev)

This is the simplest way to run the project on Windows.

## 0) Install prerequisites
- Install **Node.js 18+** (recommended: latest LTS)
- Install **Git** (only if you plan to pull updates)

## 1) Install dependencies
Open PowerShell in the repo folder and run:

```powershell
pnpm install
```

If you don’t have pnpm:

```powershell
npm install -g pnpm
pnpm install
```

## 2) Create Supabase project
1. Go to Supabase and create a new project
2. In Supabase Dashboard → **Project Settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3) Create `.env.local`
In the repo root, create a file named `.env.local`.
You can copy from `.env.example`.

Minimum required:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Recommended auth policy (so Google OAuth matches the IITM BS rules):

```env
# Allow only these domains to use Google OAuth as "Student"
STUDENT_EMAIL_DOMAINS=ds.study.iitm.ac.in,es.study.iitm.ac.in

# Only these emails can be Admin via Google OAuth
ADMIN_EMAIL_WHITELIST=you@ds.study.iitm.ac.in,otheradmin@ds.study.iitm.ac.in
```

## 4) Run database migrations (Supabase)
In Supabase Dashboard → **SQL Editor**, run the SQL files in order.

Start with the core course schema:
- `scripts/004_create_courses_tables.sql`

Then run the rest (in order):
- `scripts/005_add_profile_columns.sql`
- `scripts/006_create_storage_bucket.sql`
- `scripts/007_add_avatar_banner_columns.sql`
- `scripts/008_add_role_to_profiles.sql`
- `scripts/009_create_notes_table.sql`
- `scripts/010_notes_rls.sql`
- `scripts/011_admin_policies.sql`
- `scripts/012_create_quiz_tables.sql`
- `scripts/013_leaderboard_rpc.sql`
- `scripts/014_create_videos_table.sql`
- `scripts/015_add_premium_flag.sql`
- `scripts/016_create_payments_table.sql`
- `scripts/017_create_mentors_tables.sql`
- `scripts/018_create_notifications_table.sql`
- `scripts/019_create_proctor_tables.sql`
- `scripts/020_create_announcements_table.sql`

If you only want the app to boot and basic pages to work, the most important scripts are:
- `004`, `005`, `008` (profiles + roles), plus whichever feature tables you will use.

## 5) Configure Supabase Auth (recommended)
In Supabase Dashboard → **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000`

If you use Google OAuth:
- Authentication → Providers → Google → enable and set keys

(If you don’t set Google, email/password still works.)

## 6) Start the app

```powershell
pnpm dev
```

Open:
- http://localhost:3000

## 7) Make yourself admin (so admin pages work)
After you sign up and log in once, set your role in Supabase:

Supabase Dashboard → Table Editor → `profiles` (or `user_profiles_extended`, depending on the table used) → find your row → set `role` to `admin`.

## Optional A) Payments (Razorpay)
If you want real Razorpay order creation + signature verification:
1. Create Razorpay keys in Razorpay Dashboard
2. Add to `.env.local`:

```env
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

If you don’t set these, the app will still run (payments fall back to demo behavior).

## Optional B) WhatsApp → Announcements sync
This uses a local WhatsApp Web session via a bot script.

1) Install bot dependencies:

```powershell
pnpm add -D whatsapp-web.js qrcode-terminal node-fetch
```

2) Edit:
- `scripts/whatsapp_sync_bot.js`
  - set `GROUP_NAME`
  - set `ANNOUNCEMENTS_ENDPOINT` (local or deployed)

3) Run the bot:

```powershell
node scripts/whatsapp_sync_bot.js
```

4) Scan the QR code in your terminal with WhatsApp.

Now WhatsApp group messages will appear in Dashboard → Announcements.

## Common problems
- **Blank pages / Supabase errors**: your `.env.local` is missing or wrong.
- **401/403 errors**: you’re not logged in, or your role isn’t `admin`.
- **Migrations failing**: run them strictly in order.

