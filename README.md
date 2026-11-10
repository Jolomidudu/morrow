# Morrow

A Next.js App Router authentication starter using Supabase Auth and cookie-backed server sessions.

## Configure Supabase

1. Create a Supabase project and open **Authentication → Providers → Email**. Enable email/password sign-in. Email confirmation can remain enabled.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the project API settings. A Supabase publishable key is accepted in the second variable.
3. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the redirect URL allow list. Add the equivalent callback URL for each deployed environment.

No database migration is needed. The account name is stored in Supabase Auth user metadata; add row-level security policies before introducing application tables.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without `.env.local`, the auth screen remains available in setup mode and does not make Supabase requests.

## Included flows

- Email/password sign-up and sign-in
- Email confirmation callback and server-managed session cookies
- Password reset email and authenticated password update
- Protected `/dashboard` route and server action sign-out
- Session refresh through the Next.js request proxy

Run `npm run lint` and `npm run build` before deploying. Set the same Supabase environment variables in the deployment environment.