# Vercel Deployment Guide - NFT Trading OTC

This guide explains how to securely configure your API keys and environment variables for a successful deployment on Vercel.

## 1. Configure Vercel Environment Variables

In your Vercel Dashboard, navigate to **Project Settings > Environment Variables** and add the following keys:

| Key | Example Value |
| --- | --- |
| `ALCHEMY_API_KEY` | `your_alchemy_key_here` |
| `FIREBASE_API_KEY` | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | `your-app.firebaseapp.com` |
| `FIREBASE_DATABASE_URL` | `https://your-app.firebaseio.com` |
| `FIREBASE_PROJECT_ID` | `your-app` |
| `FIREBASE_STORAGE_BUCKET` | `your-app.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `FIREBASE_APP_ID` | `1:12345:web:abcde` |

## 2. Dynamic Environment Injection (Recommended)

Since Angular environment files are static, we need a small script to inject these Vercel variables during the build process.

### Step A: Create the Injection Script
Save the following as `scripts/set-env.js` in your project root:

```javascript
const fs = require('fs');
const path = require('path');

const envFile = `export const environment = {
  production: true,
  alchemyApiKey: '${process.env.ALCHEMY_API_KEY}',
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    databaseURL: "${process.env.FIREBASE_DATABASE_URL}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}"
  },
  enableHardRevoke: false
};
`;

const targetPath = path.join(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(targetPath, envFile);
console.log(`Environment file generated at ${targetPath}`);
```

### Step B: Update package.json
Add a `config` script and modify your `build` script to ensure it runs before building:

```json
{
  "scripts": {
    "config": "node scripts/set-env.js",
    "build": "npm run config && ng build --configuration production"
  }
}
```

## 3. Deployment Summary
Once configured, every time you push to GitHub or trigger a build on Vercel:
1.  Vercel will inject your secret variables into the environment.
2.  The `set-env.js` script will create a valid `environment.ts` with your real keys.
3.  Angular will compile a production bundle with those keys baked in.

> [!IMPORTANT]
> Never commit the generated `environment.ts` with real keys back to GitHub. Keep your placeholders in the repository!
