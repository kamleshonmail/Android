# Social Feed App (Firebase version)

A small social feed built with **Expo (React Native)** + **Firebase** (Auth, Firestore, Storage).

## What's here
- `App.js` / `src/` — the app (login, signup, feed, create post, profile)
- `firebase/firestore.rules` and `firebase/storage.rules` — paste these into the Firebase console
- `.env.example` — copy to `.env` and fill in your Firebase web app config

## 1. Push this to GitHub
Upload all these files into your GitHub repo (via GitHub's web "Upload files", or from a Codespace terminal with `git add . && git commit -m "init" && git push`).

## 2. Set up Firebase
1. Go to https://console.firebase.google.com → create a project (free).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database → start in test mode, then go to the **Rules** tab and paste in `firebase/firestore.rules`, then Publish.
4. **Storage** → note: as of Feb 2026 this requires the paid **Blaze** plan (still has a real free monthly quota — 5GB storage, 1GB/day download — you're very unlikely to be charged for a small app, but a card is required on file). If you'd rather avoid that, skip Storage and the "add photo" feature won't work, but posts, likes, auth, and profiles will.
   Once enabled, go to Storage → Rules and paste in `firebase/storage.rules`, then Publish.
5. Project settings (gear icon) → General → scroll to "Your apps" → click the web icon `</>` to register a web app → copy the config object it shows you.
6. Create a `.env` file (copy `.env.example`) and fill in the six values from that config object:
   ```
   FIREBASE_API_KEY=...
   FIREBASE_AUTH_DOMAIN=...
   FIREBASE_PROJECT_ID=...
   FIREBASE_STORAGE_BUCKET=...
   FIREBASE_MESSAGING_SENDER_ID=...
   FIREBASE_APP_ID=...
   ```

## 3. Run it — GitHub Codespaces + Expo Go, nothing local
1. On your repo: Code → Codespaces → Create codespace on main.
2. In the Codespace terminal: create the `.env` file there directly (it's gitignored, so it won't come from GitHub) with the values from Step 2.6.
3. Run:
   ```
   npm install
   npx expo start --tunnel
   ```
4. Scan the QR code with the free **Expo Go** app on your Android phone.

## Data model
- `profiles/{userId}` — `{ username, createdAt }`
- `posts/{postId}` — `{ authorId, content, imageUrl, createdAt }`
- `likes/{postId_userId}` — `{ postId, userId }` — one doc per like, so only the liker can remove their own like, and nobody can rewrite someone else's post

## A Firestore quirk to expect
The Profile screen queries posts with a `where` + `orderBy` on different fields — Firestore will likely show an error the first time with a link to auto-create the needed composite index. Just click that link, wait ~a minute for the index to build, and it'll work from then on.

## Note
This app previously used Supabase; this version is a full swap to Firebase, chosen if you want to stay in the Google/Firebase ecosystem. The screens and overall app structure are unchanged — only the data-layer files (`src/lib/firebase.js`, `AuthContext.js`, and the Firestore/Storage calls in each screen) were rewritten.
