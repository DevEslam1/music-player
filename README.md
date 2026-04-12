# GIG Music Player 🎧

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status: Production Ready" />
</p>

A premium, high-performance music player app built with **React Native**, **Expo**, and **TypeScript**. GIG Music Player offers a seamless blend of cloud-synced music management and global discovery via a custom **Railway Production Backend**, all wrapped in a stunning, theme-aware "Sonic Noir" aesthetic.

---

## 🔥 Key Features

- 🔐 **Secure Authentication**: Elegant Login and Sign Up flows powered by JWT (JSON Web Tokens) for secure user sessions.
- ☁️ **Cloud Sync**: All your Liked Songs and Playlists are synchronized in real-time with the production backend.
- 🎵 **Hybrid Search Engine**: Instantly find tracks across your local Liked Songs and the entire global catalog.
- 💊 **Floating Pill MiniPlayer**: A premium, safe-area-aware playback bar that stays accessible across all navigation screens.
- ❤️ **Smart Library**: Manage your favorite songs with backend-synced "Like" toggling.
- 📋 **Advanced Playlists**: Create, manage, and customize your collections with a soft-border, modern UI and cloud persistence.
- 🌓 **Sonic Noir Theming**: Full support for Dark and Light modes, including automatic System Status Bar icon synchronization.
- 🚀 **Performance Optimized**: Robust singleton audio service with loading locks and authenticated streaming.
- 📊 **User Insights**: A personalized Profile dashboard tracking your library growth and real account activity.

---

## 📱 Screens

| Screen          | Description                                    |
| --------------- | ---------------------------------------------- |
| **Home**        | Quick access to suggestions and popular tracks |
| **Search**      | Powerful hybrid search engine                  |
| **Liked Songs** | Your favorite tracks with cloud sync           |
| **Playlists**   | Specialized collections with full CRUD         |
| **Now Playing** | Full-screen interactive playback & visualizer  |
| **Profile**     | Real user statistics and account management    |
| **Auth**        | Secure and elegant Login/SignUp workflows      |

---

## 🛠️ Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| **Language**   | TypeScript (Strict Typing)                             |
| **Core**       | React Native (Expo SDK)                                |
| **State**      | Redux Toolkit (Async Thunks for Backend Sync)          |
| **Audio**      | Expo-Audio (Authenticated Singleton Service)           |
| **Networking** | Axios (w/ JWT Interceptors & Retry Logic)              |
| **Navigation** | React Navigation (Native Stack + Custom Drawer)        |
| **Storage**    | AsyncStorage (Safe Token & Local State Persistence)    |

---

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI (Floating MiniPlayer, Custom Drawer, ThemedText)
├── constants/           # Centralized Theme tokens and Layout metrics
├── hooks/               # useThemeColor, useSafeAreaInsets
├── navigation/          # Multilayered Stack and Drawer structure
├── redux/               # Global state with synced Async Thunks
├── services/            # Audio Service, Auth & Library API Services
└── screens/             # Feature-specific modules (Home, Search, Profile, etc.)
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) on your mobile device

### Installation & Execution

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/KarimaMahmoud626/music-player.git
   cd music-player
   ```

2. **Setup Dependencies**:
   ```bash
   npm install
   ```

3. **Launch Project**:
   ```bash
   npx expo start -c
   ```

---

## 👥 Authors

**Eslam** — [GitHub](https://github.com/DevEslam1)  
**Karima Mahmoud** — [GitHub](https://github.com/KarimaMahmoud626)
