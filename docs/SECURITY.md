# Security Guidelines & Configuration

This document specifies the security controls and policies enforced across the platform's infrastructure and codebases.

## Data in Transit

All API communication must be secured over HTTP/TLS (HTTPS).

- **NestJS CORS Config:** Explicitly restrict allowed origins to the admin domain and verified mobile app bundle identifiers.
- **Helmet Headers:** Integrated in `main.ts` to set standard security headers:
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY` (Prevent Clickjacking)
  - `X-Content-Type-Options: nosniff` (Prevent MIME-type sniffing)

## Rate Limiting (NestJS)

To prevent brute force, scraping, and denial-of-service attempts:

- Integrate NestJS `ThrottlerModule` in `AppModule`.
- Apply a global limit (e.g., maximum 100 requests per 60 seconds per IP).
- Stricter limits for heavy operations (e.g., max 5 file uploads per minute).

## Input Validation & Sanitization

- **DTO Validation:** All requests processed by NestJS must pass through a global `ValidationPipe` with options:
  - `whitelist: true` (removes non-declared properties)
  - `forbidNonWhitelisted: true` (throws 400 Bad Request on unknown properties)
- **SQL Injection Prevention:** Prisma ORM handles parameterized queries automatically, preventing SQL injection exploits.

## Database & Local Storage Security

- **PostgreSQL Database:** Credentials are never committed to source control. They are configured via `DATABASE_URL` stored in local `.env` files.
- **On-Device SQLite Cache:** Use secure keychain/keystore to save user credentials, tokens, and sensitive offline database keys.

## Secret Management

Environment variables are loaded securely via container configurations or server environments. Never commit `.env` files to git. Use validation templates like `.env.example`.
