// Example public config template. DO NOT commit real secrets. Copy this to src/config.ts locally and fill CLIENT_ID.

export const APP_CONFIG = {
  // Google OAuth 2.0 Client ID (Browser JS) - public identifier
  // Example: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'
  CLIENT_ID: 'REPLACE_ME_WITH_YOUR_GOOGLE_OAUTH_CLIENT_ID',

  // Drive folder name to create/use (app will request the user to pick or create this folder)
  DRIVE_FOLDER_NAME: 'Money Mastery',
};
