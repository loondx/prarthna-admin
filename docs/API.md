# REST API Documentation

This document outlines the API guidelines, request/response formats, and endpoint contracts for the Prarthna REST API.

## Base Configuration

- **API Version:** `v1`
- **Root Path:** `/v1`
- **Default Port:** `3001`
- **Format:** All requests and responses must use `application/json`.

---

## Authentication & Authorization

All protected endpoints require an `Authorization` header containing a Bearer Firebase JWT token.

```http
Authorization: Bearer <firebase-id-token>
```

### Roles

The system enforces role-based access control (RBAC) in the backend. User roles include:

- `user` (default)
- `admin` (super-admin access)
- `content_editor` (read/write scriptures)
- `audio_manager` (manage media assets)
- `reviewer` (editorial/audio approval)

---

## Global Standards

### Error Format (RFC 9457 Problem Details)

All API errors must follow the RFC 9457 format to provide descriptive and structured error messages to both client apps and dashboard tools.

**Example Error Response:**

```json
{
  "type": "https://prarthna.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The 'targetDate' must be in the future.",
  "instance": "/v1/sankalp",
  "code": "validation_error",
  "invalidParams": [
    {
      "name": "targetDate",
      "reason": "Date must be after 2026-07-11"
    }
  ]
}
```

### Standard Pagination

All list endpoints must accept query parameters for pagination:

- `page`: default `1`, 1-indexed
- `limit`: default `20`, max `100`

---

## Endpoint Index (Milestone 1)

### 1. Health Checks

Check API and database connection health.

- **Endpoint:** `GET /health`
- **Auth Required:** No
- **Response Status:** `200 OK`
- **Response Body:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" }
  }
}
```

### 2. Swagger OpenAPI Definition

Access generated OpenAPI specification.

- **Endpoint:** `GET /docs` (UI) or `GET /docs-json` (JSON schema)
- **Auth Required:** No
