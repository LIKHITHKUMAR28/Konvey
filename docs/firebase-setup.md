# KONVEY — Firebase Foundation Documentation

## 1. Overview
This document outlines the Firebase architecture established for **KONVEY — Keep work moving**.
KONVEY operates on the **Firebase Spark (No-Cost) Free Tier** plan.

---

## 2. Architecture & Modules

```text
                     KONVEY App
                         │
                    Firebase App
               (src/lib/firebase/config.ts)
                         │
       ┌─────────────────┼─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
 Firebase Auth      Firestore          Storage
  (auth.ts)       (firestore.ts)     (storage.ts)
       │                 │                 │
    Identity         Work Data       Future Assets
                    (Multi-Tenant)      (Dormant)
```

All Firebase services share a single `FirebaseApp` instance initialized in `src/lib/firebase/config.ts`.

---

## 3. Environment Variables
Configuration is isolated using standard Vite environment variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Public Firebase API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `konvey.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project Identifier | `konvey` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Cloud Storage Bucket | `konvey.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `000000000000` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID | `1:0000:web:0000` |

Copy `.env.example` to `.env.local` to override with live project credentials.

---

## 4. Firestore Foundation & Collections
Collections follow the organizational hierarchy:

- `organizations`
- `users`
- `teams`
- `projects`
- `tasks`
- `dependencies`
- `comments`
- `activities`
- `blockers`
- `decisions`
- `scopeEvents`
- `focusSessions`
- `notifications`
- `projectHealthSnapshots`

### Multi-Tenant Rule:
Every document (except global users/organizations) must store an `organizationId` attribute for future Security Rules partitioning.

---

## 5. Authentication Provider
The only initial identity provider is **Email / Password**.
Exported abstractions:
- `signUpWithEmail(email, password, displayName)`
- `signInWithEmail(email, password)`
- `signOutUser()`
- `sendPasswordReset(email)`
- `getCurrentUser()`
- `onAuthChange(callback)`

---

## 6. Storage Decision
Storage is initialized via `getStorage(app)` but kept strictly minimal/dormant for Phase 1 to protect Spark tier limits (5 GB storage / 1 GB daily download bandwidth).

---

## 7. Running Locally
```bash
npm run dev
```
Build verification:
```bash
npm run build
```
Lint verification:
```bash
npm run lint
```
