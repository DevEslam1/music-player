# GiG Player 🎵

A full-featured music streaming and offline playback app built with React Native (Expo). Stream tracks from a backend API, download them for offline listening, manage playlists, and enjoy a premium audio experience with lock-screen controls and fluid gesture interactions.

---

## Screenshots

> Run the app and use the built-in screens to explore the UI.

---

## Features

### 🎧 Audio Playback
- Stream tracks via authenticated API (HTTPS with Bearer token)
- Background audio playback (iOS & Android)
- Lock-screen controls with artwork, seek-forward and seek-backward
- Auto-advance to next track on finish
- Repeat modes: off / repeat track / repeat queue
- Shuffle mode

### 📥 Offline / Downloads
- **Bulk Download everything** via one-tap toggles on lists/playlists
- Download any individual track to local device storage
- Automatic fallback to local file when offline
- Download progress indicator (percentage)
- Cancel active downloads
- Delete individual or all downloads
- Storage usage summary

### 🎛 Mini Player
- Persistent floating player above all screens
- **Swipe left** → next track
- **Swipe right** → previous track
- **Long press + drag** → scrub playback position in real time
- Visual arrow hints appear as you drag
- Haptic feedback on all gestures

### 📋 Now Playing Screen
- Full-screen album art with blurred background
- Breathing animation on artwork (music-reactive)
- Dynamic accent glow behind artwork
- Seekable progress slider
- Play / Pause / Next / Previous controls
- Like / Unlike track
- Add to playlist
- Animated "peek" carousel for queue context

### 🗂 Library
- Browse all tracks from the API
- Search with debounce
- Add tracks to playlists
- Like / Unlike from search results

### ❤️ Liked Songs
- Grid view of all liked tracks
- Edit mode with swipe-to-remove badges
- Pull-to-refresh

### 📂 Playlists
- Create and manage playlists
- Playlist detail view with track list
- Swipe-to-delete tracks from a playlist
- Pull-to-refresh

### 🔔 Notifications
- In-app notification screen

### 👤 Profile
- View and edit profile info
- Navigate to Notifications and Support

### ⚙️ Settings
- Toggle dark / light mode
- Select accent color (theme color picker)
- Language selection
- Contact, FAQ, Terms of Service links
- App version display

### 🌐 Connectivity
- Real-time offline detection banner
- Auto-collapses to a pill icon after 5 seconds
- Floating "Downloads" FAB when offline
- All errors, alerts, and messages displayed through the same unified banner (no system Alert dialogs)

### 🔐 Authentication
- Login / Sign Up screens with validation
- Persistent sessions via AsyncStorage token storage
- Silent token refresh via Axios interceptors
- Auto-login on app restart

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native + Expo SDK 55 |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Navigation | React Navigation (Native Stack + Drawer) |
| Audio | expo-audio (background + lock screen) |
| Images | expo-image (disk cache) |
| Gestures | react-native-gesture-handler |
| Animations | react-native-reanimated |
| HTTP Client | Axios (with interceptor-based token refresh) |
| Storage | AsyncStorage |
| File System | expo-file-system |
| Haptics | expo-haptics |
| Network | @react-native-community/netinfo |

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── MiniPlayer.tsx       # Gesture-enabled floating player
│   ├── OfflineBanner.tsx    # Unified notification + offline banner
│   ├── DownloadButton.tsx   # Download / cancel / remove button
│   ├── AuthInitializer.tsx  # App bootstrap + auth hydration
│   ├── PlaylistPicker.tsx   # Bottom sheet playlist picker
│   ├── NowPlaying/          # Now Playing sub-components
│   └── ...
├── screens/             # Full application screens
│   ├── Auth/                # Login, SignUp, Welcome
│   ├── Home/                # Home feed + track list
│   ├── Library/             # Search / browse
│   ├── LikedSongs/          # Liked songs grid
│   ├── Playlist/            # Playlist list + detail
│   ├── Downloads/           # Offline library
│   ├── NowPlaying/          # Full player
│   ├── Profile/             # User profile
│   ├── Settings/            # App settings
│   ├── Notifications/       # Notifications
│   ├── Support/             # Support page
│   ├── Contact/             # Contact form
│   ├── FAQ/                 # FAQ page
│   ├── Language/            # Language picker
│   └── Legal/               # Terms of Service
├── navigation/          # AppNavigator + DrawerNavigator
├── redux/store/         # Redux slices
│   ├── auth/                # Auth state (login, profile, token)
│   ├── player/              # Playback state (track, queue, progress)
│   ├── library/             # Track library cache
│   ├── downloads/           # Downloaded tracks + progress
│   ├── theme/               # Dark mode + accent color
│   └── ui/                  # Global UI state (banner messages)
├── services/
│   ├── api/                 # Axios client, auth, library, download services
│   ├── audio/               # AudioPlayerService singleton
│   ├── auth/                # Token read/write (AsyncStorage)
│   ├── logic/               # Screen logic hooks
│   └── storage/             # Theme preferences persistence
├── hooks/               # useThemeColor, useAccentColor
├── constants/           # Theme tokens, accent colors
├── types/               # Global TypeScript types
└── utils/               # Validation helpers
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android builds) or Xcode (for iOS builds)
- A running backend API (configured in `src/services/api/axiosClient.ts`)

### Install

```bash
git clone <repo-url>
cd music-player
npm install
```

### Run (Development)

```bash
# Start Expo dev server
npx expo start

# Android (with dev client)
npx expo run:android

# iOS
npx expo run:ios
```

### Build (Production)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure (first time)
eas build:configure

# Android APK / AAB
eas build --platform android

# iOS IPA
eas build --platform ios
```

---

## Key Architecture Decisions

### Unified Messaging via `OfflineBanner`
All user-facing messages (errors, success, warnings, info) go through the `OfflineBanner` component driven by the `ui` Redux slice. No `Alert.alert` dialogs are used anywhere in the app. Messages auto-dismiss after 3 seconds; offline status persists until connectivity is restored.

### Audio as a Singleton Service
`AudioPlayerService` is a singleton that manages a single `expo-audio` player instance. It handles track loading, lock-screen metadata, progress dispatch (throttled to 500ms), auto-next-on-finish, and offline/streaming source resolution transparently.

### Image Caching
All images use `expo-image` with `contentFit="cover"` for automatic disk caching, reducing network usage on repeated views.

### Token Refresh
Axios interceptors silently refresh expired access tokens using the stored refresh token before retrying the original request. No user action required.

### Gesture-First Mini Player
The mini player uses `react-native-gesture-handler`'s `Gesture.Pan()` API composed with `Gesture.Simultaneous()` so swipe-to-change-track and long-press-to-scrub can coexist without conflict, both running on the UI thread via Reanimated shared values.

### Runtime Dependency Injection
To prevent Metro bundler `Require cycle` loops that cause sporadic `undefined` errors (e.g. from circular imports like `components -> store -> slice -> service -> components`), services such as `DownloadService` leverage run-time dependency injection (`injectRedux`), initialized safely inside `AppBootstrap`.

---

## Permissions

| Permission | Reason |
|---|---|
| `INTERNET` | Stream audio and fetch track data |
| `FOREGROUND_SERVICE` | Background audio playback (Android) |
| `FOREGROUND_SERVICE_AUDIO_PLAYBACK` | Lock screen controls (Android) |
| `WAKE_LOCK` | Keep audio alive while screen is off |
| `ACCESS_NETWORK_STATE` | Detect offline/online status |

---

## License

Private — all rights reserved.
