# Flutter Mobile Architecture

This document details the architectural layout, state management strategy, navigation flow, and offline persistence mechanism for the Prarthna mobile application.

## Directory Structure

The mobile project uses a feature-first approach:

```
lib/
├── main.dart                 # App initialization, GoRouter routes, ProviderScope
├── navigation_shell.dart     # Bottom navigation shell structure (5-tab shell)
├── screens/                  # Feature screens
│   ├── home_screen.dart      # Main dashboard with greeting and quick actions
│   ├── library_screen.dart   # Scripture browser with categories
│   ├── sankalp_screen.dart   # Active habits commitment tracking
│   ├── community_screen.dart # User social feed and updates
│   ├── profile_screen.dart   # Journey statistics, settings, history
│   ├── verse_reading_screen.dart # Scripture reader with Sanskrit transliteration
│   └── audio_player_screen.dart  # Music/chanting background audio player
├── services/                 # Remote API integration and services
│   ├── api_client.dart       # Dio instance configuration
│   └── audio_handler.dart    # Background audio playback logic
└── database/                 # Offline storage & caching
    ├── local_db.dart         # Drift database schema definition
    └── sync_manager.dart     # Offline data synchronization worker
```

## State Management (Riverpod)

We use **Riverpod** for robust, compile-safe state management.

- **`ProviderScope`:** Wrapped at the root of the application in `main.dart`.
- **API State:** Managed via `FutureProvider` or `StateNotifierProvider` listening to API client actions.
- **Audio State:** Driven by a global `AudioHandlerProvider` exposing playback states (playing, paused, position, volume).
- **Sankalp Progress:** State notifier that updates active habit counts, triggering synchronization requests.

## Navigation & Deep Linking

Navigation is driven by **GoRouter**.

- **IndexedStack Navigation:** Utilizes `StatefulShellRoute.indexedStack` to preserve individual tab scroll/widget state during user navigation transitions.
- **Deep Links:** Configured via Android `intent-filter` and iOS Universal Links mapping URLs (e.g., `prarthna://verse/{id}`) directly to the `VerseReadingScreen`.

## Local Persistence (Drift / SQLite)

For fully offline capability:

- **Drift ORM:** Used to query, save, and update database tables on-device via a SQLite database.
- **Cache Strategy:** Reads are loaded from the local Drift cache first. A background task fetches mutations and updates the local state on network connection detection.
- **Conflict Handling:** Server-side timestamp resolution handles conflicts using a "last-writer-wins" strategy.
