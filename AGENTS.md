# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

GiG Player — an Expo React Native music streaming client (Android + iOS). Connects to a Rails backend at `https://musicapp-production-bcd8.up.railway.app/api/`.

| | |
|---|---|
| Framework | Expo SDK 55, React Native 0.83.6, React 19 |
| State | Redux Toolkit (6 slices) |
| Navigation | React Navigation 7 (Native Stack + Drawer) |
| Animation | react-native-reanimated 4.2.1 |
| Audio | expo-audio |
| Persist | @react-native-async-storage/async-storage |
| Types | TypeScript ~5.9.2 |

## Common Commands

```bash
# Development
npx expo start                   # start dev server (default)
npx expo start --web             # web
npx expo run:android             # android emulator (requires Gradle/Android SDK)
npx expo run:ios                 # ios simulator (requires Xcode)

# EAS Build
eas build -p android --profile development   # dev client APK
eas build -p android --profile preview       # internal APK
eas build -p android --profile production    # release APK

# Type checking
npx tsc --noEmit
```

**Requirement**: `babel.config.js` must include `react-native-reanimated/plugin` in plugins array — it must be the **last** plugin. Do not remove it.

## Architecture

### App Entry (`App.tsx`)

The component tree bootstraps in strict order — each layer sets up what the next needs:

```
Provider (Redux store)
└── AppBootstrap           Runtime DI, 401 handler, theme persistence
    └── AuthInitializer   Auto-login, splash, first-launch check
        └── OfflineBanner Global banner
            └── ErrorBoundary
                └── NavigationContainer
                    └── RootContent   Tracks current route for MiniPlayer
                        └── AppNavigator
```

Do not reorder these providers. `AppBootstrap` must wrap `AuthInitializer` so the 401 handler is registered before any API call fires.

### Redux Store (`src/redux/store/store.ts`)

6 slices — `serializableCheck` and `immutableCheck` disabled for audio/player compatibility:

| Slice | Key state |
|---|---|
| `auth` | `isLoggedIn`, `currentUser`, `isFirstLaunch` (null = checking) |
| `player` | `currentTrack`, `queue`, `isPlaying`, `positionMillis`, `repeatMode` |
| `library` | `likedSongs`, `playlists`, `homeFeed`, loading flags |
| `downloads` | `tracks`, `activeDownloads` |
| `theme` | `isDarkMode`, `accentColor`, `hasHydrated` |
| `ui` | `banner`, `isDrawerOpen` |

**Important**: `theme.hasHydrated` starts as `false`. Components that read theme values must guard on this — or use the `useThemeColor` / `useAccentColor` hooks which handle this internally.

### Auth Flow

State machine driven by `isFirstLaunch` (AsyncStorage `@is_first_launch`) and `isLoggedIn` (Redux):

```
Cold start (isFirstLaunch = null) → Login screen (splash until resolved)
isFirstLaunch = true               → Welcome screen → Login screen (user action)
isFirstLaunch = false + no token  → Login screen
isFirstLaunch = false + token     → Drawer (auto-login via fetchProfile)
```

**Auto-login sequence** (`AuthInitializer`):
1. Load saved theme → dispatch `setThemeHydrated(true)`
2. Check `@is_first_launch` → `dispatch(setFirstLaunch(bool))`
3. `getAccessToken()` → if exists, `dispatch(fetchProfile())`
4. On failure: banner "Session expired" but still proceed to children

**Token refresh**: axios interceptor on 401 → try refresh → on failure call `notifyUnauthorized()` → `AppBootstrap` registered handler → `dispatch(logoutCompleted())`.

### Navigation

Always use the `navigate` helper from `src/navigation/navigationUtils.ts` — it safely checks `navigationRef.isReady()` before navigating:

```typescript
import { navigate } from "../navigation/navigationUtils";
navigate("Login");
navigate("PlaylistDetail", { playlistId, name });
```

Do **not** call `navigationRef.current?.navigate()` directly in business logic — use the helper.

### API Layer

Base URL: `https://musicapp-production-bcd8.up.railway.app/api/`

All HTTP calls go through `axiosClient` (`src/services/api/axiosClient.ts`):
- Bearer token injected on every request via request interceptor
- Response interceptor silently refreshes tokens on 401 (skips `/auth/login/` and `/auth/refresh/`)
- Refresh promise deduplication via module-level `refreshPromise`
- Timeout: 10s

Services:
- `AuthService` — `login`, `register`, `me`, `refreshToken`
- `LibraryService` — liked songs, playlists CRUD, play log
- `DownloadService` — downloads with runtime DI from AppBootstrap
- `AudioPlayerService` — expo-audio singleton (see below)

### Theme System

Colors defined in `src/constants/theme.ts`. Always use the hooks — never hardcode hex values:

```typescript
import { useThemeColor, useAccentColor } from "../hooks/use-theme-color";

// For named colors
const bg = useThemeColor({}, "background");
const text = useThemeColor({ light: "#fff", dark: "#000" }, "text");

// For user accent
const accent = useAccentColor();
```

Available accent colors: GiG Red (`#B34A30`), Ocean Blue, Forest Green, Royal Purple, Golden Amber, Midnight.

### Audio Player (`AudioPlayerService`)

Singleton wrapping `expo-av`'s Audio. Key behaviors:
- `.replace()` is used for track swaps to preserve Android foreground service
- Progress throttled to 500ms intervals
- Falls back to `DownloadService.getLocalUri()` for offline playback

**Runtime DI**: `DownloadService` is injected with Redux actions via `DownloadService.injectRedux()` in `AppBootstrap` to avoid Metro require cycles. Do not import `DownloadService` directly into files that also import Redux slices.

### All Feedback Goes Through One Place

Never use `Alert` or `Toast` — all user-facing messages (errors, success, offline) are driven by `ui.banner` in Redux and rendered by `OfflineBanner`:

```typescript
import { store } from "../redux/store/store";
import { showBanner } from "../redux/store/ui/uiSlice";
store.dispatch(showBanner({ message: "...", type: "error" | "success" | "warning" }));
```

## Key Gotchas

- **`fetchProfile.rejected` does NOT set `isLoggedIn = false`** — on rejection the user just sees the Login screen (initialRouteName computed reactively from token check). Do not add `logoutCompleted` to the rejected handler — the unauthorized interceptor already handles token expiry.
- **Welcome → Login must be explicit** — `handleGetStarted` in `Welcome.tsx` calls `navigate("Login")` after dispatching `setFirstLaunch(false)`. Without the navigate call the user stays on Welcome.
- **Logout must navigate** — `logoutAction` clears tokens and Redux state but does NOT navigate. Call `navigate("Login")` after dispatching it (ProfileScreen does this).
- **`isFirstLaunch` starts as `null`** — AuthInitializer sets it asynchronously. AppNavigator gates `initialRouteName` with `isAuthReady = isFirstLaunch !== null` to prevent showing Welcome briefly before the check resolves.
- **`@react-native-async-storage/async-storage`**: all token keys — `access_token`, `refresh_token`, `@is_first_launch` — are managed in `src/services/auth/session.ts`. Do not duplicate keys elsewhere.
- **Home feed TTL**: 5 minutes. Defined as `HOME_FEED_TTL_MS` in the relevant logic file — do not hardcode.
- **Download guard**: files < 10KB after download are treated as error responses and deleted.
- **Batch download**: max 3 concurrent tracks.
- **`react-native-reanimated/plugin` must be last** in babel plugins array. If TypeScript errors appear on `Animated.` components, verify the plugin order before assuming there's a type problem.
