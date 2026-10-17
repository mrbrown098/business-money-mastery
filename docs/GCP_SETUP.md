# Google Cloud / OAuth Client ID setup (beginner guide)

Purpose: Create an OAuth 2.0 Client ID used only for browser JS (no client secret). This app will ask users to sign in with Google using Google Identity Services (GIS) and request these scopes:
- openid
- email
- profile
- https://www.googleapis.com/auth/drive.file

Important: Use the GitHub Pages origin (no path) as the Authorized JavaScript origin. Example for this repo (replace with your username):

- Authorized JavaScript origin: https://mrbrown098.github.io

Do NOT add repo-path like https://mrbrown098.github.io/business-money-mastery as an authorized origin — use the root github.io domain.

Steps (manual, in Google Cloud Console web UI):
1) Open https://console.cloud.google.com/
2) SELECT or CREATE a project for the app
3) In the left menu: APIs & Services → OAuth consent screen
   - App type: Internal (if you will only use within a GSuite org) or External (most users choose External)
   - Add App name (MizanFlow), Support email, and Developer contact email.
   - Save and continue (no need to add scopes now)
4) In the left menu: Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: MizanFlow JS Client
   - Authorized JavaScript origins: https://mrbrown098.github.io
   - Authorized redirect URIs: (leave empty for GIS if using popup flow)
5) Create and copy the Client ID (NOT a secret). Keep it safe; do NOT commit any real client secret anywhere.

Where to put the Client ID in this repo:
- Use the file `src/config.example.ts` as a template. Create a local copy `src/config.ts` with the exported CLIENT_ID string. Never commit `src/config.ts` to the repository.

At runtime, the app will load the public CLIENT_ID from window or config and call Google Identity Services.

