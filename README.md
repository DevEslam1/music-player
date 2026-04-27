# GiG Player 🎧

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status: Production Ready" />
</p>

A premium, high-performance music player app built with **React Native**, **Expo (SDK 55)**, and **TypeScript**. GiG Player V2.0 offers a seamless blend of cloud-synced music management, global discovery, and **Offline Playback**, all wrapped in a stunning, theme-aware "Sonic Noir" aesthetic with advanced **Reanimated 4** animations.

---

## 🔥 Key Features (V2.0 Core)

- 🎨 **V2.0 Immersive Artwork**:
  - **Extra-Large Covers**: Immersive 85% width artwork with soft, high-quality corner rounding.
  - **"Aura Glow"**: A dynamic, pulsing color halo behind the cover art that adapts to the app's accent theme.
  - **Breathing Animations**: Rhythmic scale pulsations that bring the interface "to life" during active playback.
- ⏬ **Offline Mode**:
  - **Local Caching**: Download your favorite tracks directly to your device via `expo-file-system`.
  - **No-Connection Playback**: Automatically falls back to local files when the internet is unavailable.
- 💅 **Premium High-Fidelity UI**: 
  - **Glassmorphism**: Translucent, blurred MiniPlayer and Now Playing overlays for a modern, OS-integrated feel.
  - **Immersive Backgrounds**: Dynamic, blurred album art backgrounds that adapt to the current track.
  - **Skeleton Shimmer**: Animated skeleton loaders on the Home screen to improve perceived performance during data fetching.
- 🔐 **Secure Authentication**: Elegant Login and Sign Up flows powered by JWT (JSON Web Tokens) with a unified **Custom Authentication Splash Screen** to mask loading phases, and aggressive cache wiping to prevent crossover credential errors.
- ☁️ **Cloud Sync**: All your Liked Songs, Playlists, and History are synchronized in real-time with the production backend.
- 📳 **Tactile feedback**: Integrated **Haptic Feedback** (via `expo-haptics`) for button presses, track changes, and list interactions.
- 🎵 **Hybrid Search Engine**: Instantly find tracks across your local Liked Songs and the entire global catalog.
- 📋 **Advanced Playlists**: Create, manage, browse, and delete playlists with full cloud persistence and CRUD operations.
- 🔄 **Infinite Pagination**: The suggestion and list tracking engine seamlessly loads dynamic content via background offset updates as you scroll to the edge of tracks.
- 💊 **Floating Pill MiniPlayer**: A safe-area-aware playback bar with a vibrant progress indicator and **Adaptive Controls** that dim when navigation is limited.
- 🎵 **Background Audio**: Music continues playing when the app is minimized or the screen is locked (utilizing `expo-audio`).
- 🌓 **Sonic Noir Theming**: Full Dark and Light mode support with automatic System Status Bar synchronization.
- 🚀 **Performance Optimized**: 3-layer image rendering architecture to prevent transition artifacts and clipping during zoom animations.

---

## 📱 Screens

| Screen              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| **Home**            | Recommendations & Favorites with Shimmer loading states  |
| **Search**          | Powerful hybrid search with quick add-to-playlist        |
| **Liked Songs**     | Your favorite tracks with cloud sync & loading indicators|
| **Playlists**       | Specialized collections with full CRUD operations        |
| **Now Playing**     | Immersive playback with blurred art & repeat/shuffle     |
| **Profile**         | Real user statistics and personal library dashboard      |
| **Settings**        | Theme toggle, language, and support navigation          |
| **FAQ**             | Expandable answers to common questions                   |
| **Auth**            | Validated Login & SignUp with reactive forms             |
| **Downloads**       | Manage cached tracks for offline consumption             |

---

## 🛠️ Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| **Language**   | TypeScript (Strict Typing)                            |
| **Core**       | React Native (Expo SDK 55)                            |
| **State**      | Redux Toolkit (Async Thunks for Backend Sync)         |
| **Animations**  | React Native Reanimated 4 (Pulse & Breathe)           |
| **Audio**      | Expo-Audio (Foreground/Background & Offline)          |
| **Networking** | Axios (w/ JWT Interceptors)                           |
| **Navigation** | React Navigation (Native Stack + Custom Drawer)       |
| **Storage**    | Expo FileSystem (Offline Track Management)            |

---

## ⚙️ Getting Started

### Installation

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/DevEslam1/music-player.git
   cd music-player
   ```

2. **Setup Dependencies**:
   ```bash
   npm install
   ```

3. **Launch Project**:
   ```bash
   npx expo start
   ```

### 📦 Production Build (APK)

GiG Player is ready for production. To generate an Android APK using EAS CLI:

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Login**: `eas login`
3. **Build**: `eas build -p android --profile preview`

---

## 👥 Authors

**Eslam** — [GitHub](https://github.com/DevEslam1)  
**Karima Mahmoud** — [GitHub](https://github.com/KarimaMahmoud626)
