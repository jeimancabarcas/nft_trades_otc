const fs = require('fs');
const path = require('path');

const envFile = `export const environment = {
  production: true,
  alchemyApiKey: '${process.env.ALCHEMY_API_KEY || 'YOUR_ALCHEMY_API_KEY'}',
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY'}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_FIREBASE_AUTH_DOMAIN'}",
    databaseURL: "${process.env.FIREBASE_DATABASE_URL || 'YOUR_FIREBASE_DATABASE_URL'}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID'}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_FIREBASE_STORAGE_BUCKET'}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_FIREBASE_MESSAGING_SENDER_ID'}",
    appId: "${process.env.FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID'}"
  },
  enableHardRevoke: false
};
`;

const targetPath = path.join(__dirname, '../src/environments/environment.ts');

// Ensure directory exists
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envFile);
console.log(`Environment file generated at ${targetPath}`);
