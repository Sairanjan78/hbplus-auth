# HB+ Workspace — Domain-restricted Google Sign-In (React Native + Web)

One Expo / React Native codebase that runs on **Android, iOS and the Web** (React Native for Web).
Users sign in with **Google OAuth 2.0** through **Firebase Authentication**, and only accounts on the
allowed domain (default **`@hbplus.fit`**) get in. Everyone else sees:

> Access restricted. Please login using your official domain email.

**Live demo:** _add your Netlify URL here_

---

## Features

| Requirement | Where |
|---|---|
| Google Sign-In button with loading state | `src/components/GoogleButton.tsx`, `src/app/login.tsx` |
| Domain validation (client) | `src/lib/emailDomain.ts`, `src/context/AuthContext.tsx` |
| Domain validation (server / database) | `firestore.rules` |
| Protected Dashboard | `src/app/(protected)/dashboard.tsx` |
| Logout | Dashboard top bar → `signOut()` |
| Error handling | `AuthContext.friendlyError`, `ErrorBanner` |
| **Bonus:** Admin / User roles | `users/{uid}.role`, `src/app/(protected)/admin.tsx` |
| **Bonus:** User data stored in DB | Cloud Firestore `users` collection |
| **Bonus:** Route protection | `Stack.Protected` guards in `src/app/_layout.tsx` + `(protected)/_layout.tsx` |
| Responsive, clean UI | Two-column login on wide screens, 1–3 column dashboard grid |

## Tech stack

- Expo SDK 58, React Native 0.88, React Native Web, Expo Router (file-based routing)
- Firebase Authentication (Google provider) + Cloud Firestore
- `expo-auth-session` (Authorization Code + PKCE) on mobile, Firebase popup on web
- TypeScript (strict)

## Folder structure

```
.
├── src/
│   ├── app/                      # Routes (Expo Router) – every file is a screen
│   │   ├── _layout.tsx           # AuthProvider + top-level route guards
│   │   ├── index.tsx             # / → redirects to /login or /dashboard
│   │   ├── login.tsx             # Login page
│   │   ├── +not-found.tsx        # Unknown URLs redirect safely
│   │   └── (protected)/          # Only reachable with a valid session
│   │       ├── _layout.tsx       # Session guard + admin-only guard
│   │       ├── dashboard.tsx     # Dashboard page
│   │       └── admin.tsx         # Admin: users & roles
│   ├── components/               # Reusable UI (GoogleButton, Card, Avatar, ErrorBanner…)
│   ├── config/env.ts             # Typed access to EXPO_PUBLIC_* config
│   ├── context/AuthContext.tsx   # Auth state machine (single source of truth)
│   ├── hooks/
│   │   ├── useGoogleSignIn.ts      # Android / iOS Google flow
│   │   └── useGoogleSignIn.web.ts  # Web Google flow
│   ├── lib/
│   │   ├── emailDomain.ts        # Pure domain matcher (unit tested)
│   │   ├── domain.ts             # Policy helpers + error message
│   │   ├── firebase.ts           # Firebase init (web persistence)
│   │   └── firebase.native.ts    # Firebase init (AsyncStorage persistence)
│   ├── services/userService.ts   # Firestore user profile + roles
│   └── theme/                    # Colours, spacing, radius
├── tests/emailDomain.test.ts     # Domain-validation unit tests
├── firestore.rules               # Server-side domain + role enforcement
├── netlify.toml                  # Build, SPA fallback, security headers
└── .env.example
```

Platform-specific files (`*.web.ts`, `*.native.ts`) are picked automatically by Metro, so the
screens and business logic are shared 100% across platforms.

---

## Setup

### 1. Prerequisites
Node 20+ (22 recommended), a Firebase project, and for mobile an Android emulator / iOS simulator.

### 2. Install
```bash
git clone <this-repo> && cd hbplus-auth
npm install
cp .env.example .env
```

### 3. Firebase
1. Firebase console → **Add project**.
2. **Build → Authentication → Sign-in method → Google → Enable.**
3. **Build → Firestore Database → Create database** (production mode).
4. **Project settings → Your apps → Add app → Web**, copy the config into the `EXPO_PUBLIC_FIREBASE_*` values in `.env`.
5. **Authentication → Settings → Authorized domains**: add `localhost` (already there) and your Netlify domain, e.g. `your-app.netlify.app`.
6. Deploy the rules: `npm i -g firebase-tools && firebase login && firebase deploy --only firestore:rules --project <project-id>`
   (or paste `firestore.rules` into the console's Rules tab).

### 4. Google OAuth client IDs (Google Cloud console → APIs & Services → Credentials)
Use the Google Cloud project that Firebase created.

| Client | Type | Settings | `.env` key |
|---|---|---|---|
| Web | Web application | Created automatically by Firebase ("Web client (auto created by Google Service)") | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| Android | Android | Package `fit.hbplus.auth` + SHA-1 of your debug keystore (`cd android && ./gradlew signingReport`, or `eas credentials`) | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` |
| iOS | iOS | Bundle ID `fit.hbplus.auth` | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |

### 5. Access policy
```
EXPO_PUBLIC_ALLOWED_DOMAIN=hbplus.fit
EXPO_PUBLIC_ADMIN_EMAILS=admin@hbplus.fit
```
Keep `bootstrapAdmins()` in `firestore.rules` in sync with `EXPO_PUBLIC_ADMIN_EMAILS`
(and the domain regex if you change the domain).

### 6. Run
```bash
npm run web          # browser at http://localhost:8081
npx expo run:android # Android emulator (development build)
npx expo run:ios     # iOS simulator (macOS)
```
> Google sign-in on mobile needs a **development build** (`expo run:*` or `eas build --profile development`),
> not Expo Go, because the OAuth redirect uses the app's own scheme/package.

### 7. Checks
```bash
npm run typecheck    # tsc --noEmit
npm test             # domain-validation unit tests
npm run build:web    # static web export to dist/
```

---

## Deploying to Netlify

`netlify.toml` already contains the build command, publish dir and SPA fallback.

1. Push the repo to GitHub.
2. Netlify → **Add new site → Import from Git** → pick the repo.
3. **Site settings → Environment variables**: add every `EXPO_PUBLIC_*` value from `.env`.
4. Deploy. Then add the Netlify domain to **Firebase → Authentication → Authorized domains**.

CLI alternative:
```bash
npm run build:web
npx netlify-cli deploy --prod --dir dist
```

---

## Authentication flow

```
 [Login with Google]
        │
        ▼
 Web:    Firebase signInWithPopup(GoogleAuthProvider, hd=hbplus.fit)
 Mobile: expo-auth-session (OAuth 2.0 Auth Code + PKCE, system browser)
         → Google ID token → signInWithCredential(GoogleAuthProvider.credential(idToken))
        │
        ▼
 Firebase session created ──► onAuthStateChanged (AuthContext)
        │
        ├─ email_verified && email domain == hbplus.fit ?
        │        │ no  → delete the just-created Firebase user, signOut(),
        │        │       show "Access restricted. Please login using your official domain email."
        │        │ yes ↓
        ├─ upsert users/{uid} in Firestore (role: user | admin)
        ▼
 status = signedIn  →  Stack.Protected unlocks (protected)/dashboard
```

States: `initializing` (session being restored – only a loader is rendered) → `signedOut` | `signedIn`.
`busy` drives the button spinner during the Google flow and post-login verification.

## How domain restriction works

It is enforced in **three layers**, so bypassing the UI does not grant access:

1. **Hint (UX only).** The `hd=hbplus.fit` parameter makes Google's account chooser prefer company accounts.
   Google documents this as a hint, so it is never trusted on its own.
2. **Client gate.** Every session — fresh login, page reload or app restart — passes through
   `onAuthStateChanged` in `AuthContext`. `matchesDomain()` takes the text after the **last** `@`,
   lower-cases it and compares it **exactly** to the allowed domain, and the email must be verified.
   This rejects look-alikes such as `a@hbplus.fit.evil.com`, `a@sub.hbplus.fit`, `a@xhbplus.fit`
   (see `tests/emailDomain.test.ts`). Outsiders are signed out and their Firebase account is deleted.
3. **Server gate.** `firestore.rules` refuses every read and write unless
   `request.auth.token.email_verified == true` and the token's email matches `.*@hbplus[.]fit$`.
   The token is signed by Google/Firebase, so it cannot be forged from the client.

> Optional hardening: with Firebase Identity Platform enabled you can add a `beforeSignIn`
> blocking function that throws for other domains, so outsiders never get a Firebase session at all.

## Roles (Admin / User)

- Profiles live in `users/{uid}`: `uid, email, displayName, photoURL, role, createdAt, lastLoginAt`.
- First login creates the profile with role `user`, or `admin` for emails in the bootstrap admin list.
- Rules forbid users from changing their own role; only an admin can change **another** user's role
  (Admin page → *Make admin / Make user*).
- The admin route is guarded in the router (`Stack.Protected guard={isAdmin}`) **and** the data
  (`allow list: if isAdmin()`), so typing `/admin` as a normal user shows nothing.

## Protected routes

- While Firebase restores a session, the app renders only a loader, so protected screens never flash.
- `Stack.Protected` removes routes whose guard is false: visiting `/dashboard` signed-out lands on `/login`;
  visiting `/login` signed-in lands on `/dashboard`.
- `(protected)/_layout.tsx` adds a second `<Redirect href="/login" />` guard.
- Unknown URLs redirect via `+not-found.tsx`. On Netlify, `/*` falls back to `index.html` so deep links work.

## Token handling

- The app never stores raw OAuth tokens. The Google ID token is exchanged once for a Firebase credential and dropped.
- Firebase keeps a short-lived (1 h) ID token plus a refresh token and renews it automatically:
  IndexedDB on web (`browserLocalPersistence`), AsyncStorage on mobile (`getReactNativePersistence`).
- Mobile uses Authorization Code + PKCE through the system browser (no embedded WebView).
- Logout calls `signOut()`, which clears the persisted session on every platform.
- `EXPO_PUBLIC_*` values are public identifiers, not secrets; access is enforced by rules, not by hiding config.
- Netlify sends `X-Frame-Options: DENY`, `nosniff`, HSTS, a strict referrer policy, and
  `Cross-Origin-Opener-Policy: same-origin-allow-popups` (needed for the Google popup).

## Testing the two required cases

| Account | Result |
|---|---|
| `someone@hbplus.fit` | Lands on the Dashboard |
| `someone@gmail.com` | Stays on Login with “Access restricted. Please login using your official domain email.” |

> Tip for reviewers without an `@hbplus.fit` Google account: set `EXPO_PUBLIC_ALLOWED_DOMAIN` (and the
> regex in `firestore.rules`) to a domain you own to see the success path, or keep `hbplus.fit` to see the rejection path.
