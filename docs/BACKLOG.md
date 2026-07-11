# Project Backlog

This backlog is organized sequentially by milestones, ensuring that the platform foundations are established before advanced features are added.

## Milestone 1: Repository and Workspace Foundation ── **[IN PROGRESS]**

- [ ] Initialize pnpm monorepo workspace configurations
- [ ] Create placeholder applications: NestJS API, Next.js admin, NestJS worker
- [ ] Initialize the Flutter mobile application in `prarthna-mobile/`
- [ ] Configure formatting (Prettier), linting (ESLint, Flutter Linter), and environment configuration files
- [ ] Create Docker Compose for local development with PostgreSQL
- [ ] Set up health checks for the NestJS API and PostgreSQL database
- [ ] Set up Swagger/OpenAPI documentation generation
- [ ] Build Flutter five-tab navigation shell (Home, Library, Sankalp, Progress, Profile)
- [ ] Build Next.js role-aware admin shell with placeholder routes
- [ ] Configure GitHub Actions for code linting, formatting, testing, and builds
- [ ] Run all tests and verify all production builds succeed

## Milestone 2: Docker Development Environment

- [ ] Configure standard Dockerfiles for API, worker, and admin dashboard
- [ ] Standardize environment variables and configuration loading
- [ ] Setup volume mounting for hot reloading during development

## Milestone 3: PostgreSQL and Prisma Foundation

- [ ] Configure Prisma schema with initial entities (User, Device, Session, ContentCollection, etc.)
- [ ] Define initial migrations
- [ ] Verify Prisma client generation and integration with database container

## Milestone 4: NestJS Foundation

- [ ] Set up NestJS config, custom exceptions, global filters, and structured logging
- [ ] Setup RFC 9457-style Problem Details error formatting
- [ ] Build basic NestJS Healthcheck module

## Milestone 5: Next.js Admin Shell

- [ ] Establish admin layouts, navigation, and page containers
- [ ] Set up client-side data fetching with TanStack Query and mock controllers

## Milestone 6: Flutter Application Shell

- [ ] Establish GoRouter, Riverpod configurations, and theme system
- [ ] Design base page widgets for the five tabs

## Milestone 7: Firebase Authentication

- [ ] Set up Firebase Auth client integration on mobile
- [ ] Set up NestJS Guard using Firebase Admin SDK to verify authorization headers

## Milestone 8: User and Device Management

- [ ] Create database tables for User, Identity, and Device
- [ ] Build API endpoints for registering users, syncing devices, and updating profile preferences

## Milestone 9: Generic Content Architecture

- [ ] Configure full content schema (Collection, Node, Unit, LocalizedContent, MediaAsset)
- [ ] Build API services to query scriptures by tree hierarchies

## Milestone 10: Content-Management Admin

- [ ] Build Next.js admin interfaces for viewing, adding, and updating content collections, nodes, and units
- [ ] Enforce roles and permission gates in the admin panel and backend

## Milestone 11: Bhagavad Gita Content Import

- [ ] Create scripts to parse and seed Bhagavad Gita chapters, verses, translations, and commentaries
- [ ] Run database seed scripts and verify content integrity

## Milestone 12: Mobile Onboarding

- [ ] Build the onboarding flow widgets (Language, Goal, Minutes, Mode, Days, Reminders, Preview, Auth)
- [ ] Store onboarding state in local Drift database

## Milestone 13: Mobile Library

- [ ] Build library browser screen using the NestJS content APIs

## Milestone 14: Reader Screen

- [ ] Build reader screen with rich typography, Sanskrit display, transliterations, commentary, theme adjustments

## Milestone 15: Sankalp Planning

- [ ] Implement backend algorithm to generate personal reading schedules based on daily minutes and goals
- [ ] Create endpoints to fetch and update Sankalp plans

## Milestone 16: Reading & Listening Progress

- [ ] Build progress tracking APIs and mobile listeners
- [ ] Save read/listened status to local database and sync to backend

## Milestone 17: Audio Upload & Processing

- [ ] Build NestJS media processing job queue using pg-boss and FFmpeg to transcode audio files
- [ ] Integrate local file storage provider

## Milestone 18: Mobile Audio Player

- [ ] Build background audio player using `just_audio` and `audio_service` on mobile

## Milestone 19: Notifications and Deep Links

- [ ] Implement FCM push notifications and deep linking to specific content units or Sankalp screens

## Milestone 20: Offline Downloads and Sync

- [ ] Build outbox-based synchronization manager for offline progress and offline reading

## Milestone 21: Subscriptions and Entitlements

- [ ] Implement plans, payment configurations, and user entitlement validation

## Milestone 22: Analytics

- [ ] Track user session habits, reading milestones, and feature interactions

## Milestone 23: Staging Deployment

- [ ] Set up Docker Compose staging configs, Nginx reverse proxy, and deploy to VPS

## Milestone 24: Android Closed Testing

- [ ] Generate Android App Bundle and upload to Google Play Console for internal testing

## Milestone 25: Production Release

- [ ] Build and launch production backend and mobile app configurations
