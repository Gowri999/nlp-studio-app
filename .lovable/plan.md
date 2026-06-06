# Supabase Email/Password Auth

**Scope**: Swap mock auth for real Supabase auth. Email-only (no profiles table). Instant login (email confirmation disabled).

## 1. Supabase config
- Disable "Confirm email" in Auth settings so signup logs in immediately.
- No DB migration needed (using built-in `auth.users`).

## 2. Rewrite `src/lib/auth.tsx`
Keep the same `useAuth()` API the rest of the app already uses (`user`, `ready`, `login`, `register`, `logout`, `totalAnalyzed`, `bumpAnalyzed`) so existing pages keep working. Internals change:
- `user` derived from `supabase.auth.getSession()` + `onAuthStateChange` listener (set listener first, then call getSession — per Supabase best practice).
- `login(email, password)` → `supabase.auth.signInWithPassword`.
- `register(name, email, password)` → `supabase.auth.signUp` with `emailRedirectTo: window.location.origin`. Name stored in `user_metadata`.
- `logout()` → `supabase.auth.signOut()`.
- `socialLogin` removed (not requested) — also strip the Google/GitHub buttons from `AuthForms.tsx`.
- `totalAnalyzed` stays in localStorage keyed per-user-id.
- Errors thrown with Supabase's message so forms can display them.

## 3. Auth pages
- **`/login`** (`src/routes/login.tsx`): already exists — keep layout, ensure form shows server error, "Forgot password?" link to `/forgot-password`, switch link to `/signup`. Redirect to `/features` on success and if already logged in.
- **`/signup`** (`src/routes/signup.tsx`): rebuild with email + password + confirm-password fields, "Create Account" button, link back to `/login`. Validate password match client-side. Redirect to `/features` after signup.
- **`/forgot-password`**: already a placeholder — leave as-is (out of scope, not requested in this turn).
- Keep glassmorphism + cyan styling, loading spinner on submit, inline error message.

## 4. Route protection
Switch protected routes to use the existing `RequireAuth` wrapper (which now reads real Supabase session):
- `/features`, `/sentiment-analysis`, `/spam-detection`, `/topic-classification`, `/language-detection`, `/keyword-extraction`, `/ai-text-insights`, `/emotion-recognition`, `/real-time-predictions`, `/image-analyzer`, `/named-entity-recognition`, `/text-summarization`, `/language-translation`, `/hate-speech-detection`, `/voice-reader`, `/analytics`, `/model`, `/profile`.
- Public: `/`, `/demo`, `/about`, `/contact`, `/login`, `/signup`, `/forgot-password`.
- `RequireAuth` already redirects to `/login` when no session — no change needed there beyond reading the new auth context.

## 5. Navbar (`src/components/Navbar.tsx`)
- Logged out: show Home, Demo, About, Contact + **Login** and **Get Started** buttons. Hide Features / Models / Analytics / Image Analyzer.
- Logged in: show full nav, plus user email (truncated) and **Logout** button. Logout → `signOut()` → navigate to `/`.

## 6. Redirects
- After login → `/features`
- After signup → `/features`
- After logout → `/`

## Technical notes
- Use existing `@/integrations/supabase/client` browser client (publishable key, session persisted in localStorage).
- This project's auth model is the legacy `useAuth()` context + component-level `RequireAuth` (NOT the `_authenticated/` TanStack layout). Keeping that pattern to avoid restructuring every route file in this turn.
- `onAuthStateChange` listener mounted once in `AuthProvider`; cleans up on unmount.
- No `profiles` table, no RLS policies, no triggers needed.

## Files touched
- `src/lib/auth.tsx` (rewrite internals, same API)
- `src/components/AuthForms.tsx` (remove social buttons, surface server errors)
- `src/routes/signup.tsx` (real signup form with confirm-password)
- `src/routes/login.tsx` (minor: ensure error display)
- `src/components/Navbar.tsx` (logged-in vs logged-out states)
- Supabase Auth settings: disable email confirmation
