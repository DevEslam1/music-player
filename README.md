<div align="center">

# 🎧 GiG Player V2.0

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_55-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status: Production Ready" />
</p>

A premium, high-performance music player app built with **React Native**, **Expo (SDK 55)**, and **TypeScript**. GiG Player V2.0 offers a seamless blend of cloud-synced music management, global discovery, and robust **Offline Playback**, all wrapped in a stunning, theme-aware "Sonic Noir" aesthetic with advanced **Reanimated 4** animations.

</div>

---

## 🔥 What's New in V2.0: The Optimization Update

GiG Player underwent a massive, 4-phase architectural audit and polish to ensure it looks stunning and performs flawlessly at scale.

* 🛡️ **Bulletproof Security**: Re-engineered Axios interceptors with a true silent token-refresh flow, keeping user sessions alive seamlessly without crashing.
* ⚡ **Performance Leaps**: Throttled Redux playback dispatches from 60FPS to 500ms heartbeats, saving massive CPU overhead. Global image caching via `expo-image` ensures buttery smooth scrolling without network latency.
* 🔄 **Tactile Synchronization**: Universal Pull-to-Refresh across all dynamic screens (Home, Playlists, Liked Songs), bundled with `expo-haptics` for premium, OS-level physical feedback when controlling playback.
* 🧹 **Zero-Waste Rendering**: Deep static typing enforcement, React component memoization (`React.memo`), and resolution of all duplicate navigation stack anomalies. 

---

## 🌟 Core Features

### 🎨 Immersive "Sonic Noir" UI
- **Aura Glow + Breathing Animations**: A dynamic, pulsing color halo drops behind the cover art, rhythmically scaling and adapting to your custom accent theme during active playback.
- **Glassmorphism**: Translucent, blurred MiniPlayer and Now Playing overlays for a modern, native-OS integrated feel.
- **Floating Pill MiniPlayer**: A safe-area-aware playback bar with vibrant progress indicators, integrating adaptive transparency when navigating nested screens.

### 📶 Connection-Aware Offline Playback
- **Local Caching**: Download your favorite tracks directly to local storage via `expo-file-system`.
- **Smart Validation**: 3-stage validation process (HTTP 200 checks, Auth Header injection, and size guards) to prevent corrupted files from bloating your phone.
- **Zero-Latency Fallback**: The app automatically detects connection drops and shifts to local files, indicated by an intelligent, auto-collapsing Offline Status Banner.

### ☁️ Cloud Synced & Secure
- **Custom Authentication**: Elegant JWT-powered Login and Sign Up flows with proper UI feedback for session expirations.
- **Real-Time Data**: Liked Songs, Playlists, and History are synchronized in real-time with the backend. 
- **Hybrid Search Engine**: Instantly hunt for tracks locally and across the global catalog.

---

## 📱 Application Screens

| Screen | Description |
| :--- | :--- |
| **Home** | Recommendation feeds and favorites with Skeleton Shimmer loaders to boost perceived performance. |
| **Search** | Powerful hybrid search engine with rapid "Add to Playlist" capabilities. |
| **Liked Songs** | Your favorite tracks featuring pull-to-refresh cloud sync. |
| **Playlists** | Fully integrated CRUD management for custom collections. |
| **Now Playing** | Immersive playback view featuring blurred backgrounds, shuffle/loop controls, and visualizers. |
| **Downloads** | Local library management for viewing and concurrently wiping cached tracks. |
| **Settings & Profile** | Dynamic Dark/Light theme toggles, localization controls, and personal listening statistics. |

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Language** | TypeScript (Strict Typing) |
| **Framework** | React Native (Expo SDK 55) |
| **State Management** | Redux Toolkit (Async Thunks) |
| **Animations** | React Native Reanimated 4 |
| **Audio Engine** | Expo-Audio (Background & Foreground logic) |
| **Networking & HTTP** | Axios (JWT Interceptors & 401 Catching) |
| **Navigation** | React Navigation v6 (Native Stack + Custom Drawer) |
| **Files & Storage** | Expo FileSystem |

---

## ⚙️ Getting Started

### 1. Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/DevEslam1/music-player.git
cd music-player
npm install
```

### 2. Launch Local Environment

Spin up the Expo development server:
```bash
npx expo start
```
*Press `a` to run on Android, `i` to run on iOS (requires Mac), or scan the QR code using the Expo Go app on your physical device.*

### 3. Production Build (APK)

GiG Player is structured for production via EAS CLI. To generate a standalone Android APK:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

---

## 👥 Authors

Developed with 💖 by:
* **Eslam** — [GitHub](https://github.com/DevEslam1)
* **Karima Mahmoud** — [GitHub](https://github.com/KarimaMahmoud626)
