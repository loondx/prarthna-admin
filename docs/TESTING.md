# Verification & Testing Frameworks

This document details the test runner configurations, verification commands, and testing strategies implemented for the Prarthna platform.

## 1. Flutter Mobile App (`prarthna-mobile`)

We write Unit, Widget, and Integration tests in Dart.

- **Unit Tests:** Verify individual business functions and services (e.g. API clients, sync logic) by mocking network requests.
- **Widget Tests:** Verify component layout, responsiveness, and stateful rebuilds using the `flutter_test` package. We override providers in `ProviderScope` to supply mock repositories:
  ```dart
  ProviderScope(
    overrides: [
      apiClientProvider.overrideWithValue(MockApiClient()),
    ],
    child: MyApp(),
  )
  ```
- **Test Command:**
  ```bash
  flutter test
  ```

## 2. NestJS Backend API (`prarthna-backend`)

The NestJS monorepo utilizes **Jest** for unit testing and **Supertest** for E2E integration testing.

- **Unit Tests:** Controllers and services are isolated. We mock dependency services (like `PrismaService` or `HealthCheckService`) by supplying mock values in NestJS testing modules.
- **Integration Tests:** Execute requests against live endpoints, mocking external providers like Firebase Auth.
- **Test Commands:**
  - Run all tests across the workspace:
    ```bash
    pnpm test
    ```
  - Run tests for the API only:
    ```bash
    pnpm --filter api test
    ```

## 3. Next.js Admin Panel (`prarthna-admin`)

Next.js admin uses Jest and React Testing Library to verify React rendering.

- **Mocking:** Auth contexts are mocked at the parent level to simulate various roles (`editor`, `super_admin`) during testing.
- **Test Commands (Once Configured):**
  - Run unit tests:
    ```bash
    pnpm test
    ```
