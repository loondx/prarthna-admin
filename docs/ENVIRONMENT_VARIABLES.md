# Environment Variables Configuration

This document lists the required environment configuration variables for all three codebases in the Prarthna platform.

## 1. Backend API & Worker (`prarthna-backend`)

Create a `.env` file at the root of `prarthna-backend` containing:

| Variable Name           | Description                                               | Example Value                                                    |
| :---------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection URL string for Prisma.              | `postgresql://postgres:postgrespassword@localhost:5432/prarthna` |
| `PORT`                  | Port the NestJS API gateway listens on.                   | `3001`                                                           |
| `FIREBASE_PROJECT_ID`   | Project ID for Firebase Admin authentication.             | `prarthna-prod`                                                  |
| `FIREBASE_PRIVATE_KEY`  | Private key string for authenticating Admin SDK requests. | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADAN..."`                 |
| `FIREBASE_CLIENT_EMAIL` | Service account email for the Firebase project.           | `firebase-adminsdk@prarthna-prod.iam.gserviceaccount.com`        |

## 2. Next.js Admin Panel (`prarthna-admin`)

Create a `.env.local` file at the root of `prarthna-admin` containing:

| Variable Name                      | Description                                           | Example Value                   |
| :--------------------------------- | :---------------------------------------------------- | :------------------------------ |
| `NEXT_PUBLIC_API_URL`              | Destination URL for backend NestJS endpoints.         | `http://localhost:3001`         |
| `NEXT_PUBLIC_FIREBASE_API_KEY`     | Public API key for initializing Firebase client side. | `AIzaSyD-1A2B3C...`             |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain.                       | `prarthna-prod.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  | Firebase Project ID.                                  | `prarthna-prod`                 |

## 3. Flutter Mobile Application (`prarthna-mobile`)

Inject parameters at compile time using `--dart-define` flags or via a local configuration asset.

| Flag Name             | Description                            | Example Value              |
| :-------------------- | :------------------------------------- | :------------------------- |
| `API_BASE_URL`        | Gateway target URL for the NestJS API. | `https://api.prarthna.com` |
| `FIREBASE_API_KEY`    | Public Web/Mobile Firebase API key.    | `AIzaSyD-4E5F6G...`        |
| `FIREBASE_PROJECT_ID` | Firebase project identification.       | `prarthna-prod`            |
