# SpaciTech

A Next.js App Router authentication starter using Supabase Auth and cookie-backed server sessions.

## Configure Supabase

1. Create a Supabase project and open **Authentication → Providers → Email**. Enable email/password sign-in. Email confirmation can remain enabled.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the project API settings. A Supabase publishable key is accepted in the second variable.
3. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to the redirect URL allow list. Add the equivalent callback URL for each deployed environment.
4. To enable account deletion, set `SUPABASE_SERVICE_ROLE_KEY` to a Supabase server-side service role/secret key in `.env.local` and in Vercel's project environment variables. Never use a `NEXT_PUBLIC_` prefix for this key.

No database migration is needed. Display name and username are stored in Supabase Auth user metadata; usernames are not enforced as unique. Add a profiles table with row-level security if the app needs unique public usernames.

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
- Protected `/settings` page for profile, email, password, and account settings
- Reauthenticated account deletion through a server-only Supabase Admin key
- Session refresh through the Next.js request proxy

Run `npm run lint` and `npm run build` before deploying. Set the same Supabase environment variables in the deployment environment.