# GIG Music Player 🎧

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status: Production Ready" />
</p>

A premium, high-performance music player app built with **React Native**, **Expo**, and **TypeScript**. GIG Music Player offers a seamless blend of local music management and global discovery via the Deezer API, all wrapped in a stunning, theme-aware "Sonic Noir" aesthetic.

---

## 🔥 Key Features

- 🎵 **Hybrid Search Engine**: Instantly find tracks across your local Liked Songs, custom Playlists, and the entire Deezer global catalog.
- 💊 **Floating Pill MiniPlayer**: A premium, safe-area-aware playback bar that stays accessible across all navigation screens.
- ❤️ **Smart Library**: Manage your favorite songs with a functional "Edit Mode" for quick management.
- 📋 **Advanced Playlists**: Create, manage, and customize your own collections with a soft-border, modern UI.
- 🌓 **Sonic Noir Theming**: Full support for Dark and Light modes, including automatic System Status Bar icon synchronization.
- 🛡️ **Network Resilience**: Automatic 3-second retry logic for API calls ensures a smooth experience even on spotty connections.
- 🚀 **Performance Optimized**: Robust singleton audio service with loading locks to prevent race conditions and double-playback glitches.
- 📊 **User Insights**: A personalized Profile dashboard tracking your library growth and activity.
- 💡 **Interactive FAQs**: Animated accordion-style help section to guide you through all features.

---

## 📱 Screens

| Screen          | Description                                     |
| --------------- | ----------------------------------------------- |
| **Home**        | Quick access to suggestions and popular tracks  |
| **Search**      | Powerful hybrid local/remote search engine      |
| **Liked Songs** | Your favorite tracks with management tools       |
| **Playlists**   | Specialized collections for every mood          |
| **Now Playing** | Full-screen interactive playback & visualizer   |
| **Profile**     | User statistics and account management          |
| **FAQs**        | Animated support and feature guide              |
| **Auth**        | Secure and elegant Login/SignUp workflows       |

---

## 🛠️ Tech Stack

| Layer            | Technology                                                |
| ---------------- | ----------------------------------------------- |
| **Language**     | TypeScript (Strict Typing)                      |
| **Core**         | React Native (Expo SDK)                         |
| **State**        | Redux Toolkit (Slices for Library, Auth, Player) |
| **Audio**        | Expo-AV (Singleton Service Pattern)              |
| **Networking**   | Axios (w/ Interceptors & Retry Logic)            |
| **Navigation**   | React Navigation (Native Stack + Custom Drawer) |
| **Layout**       | React Native Safe Area Context                  |
| **Icons**        | Ionicons (Expo Vector Icons)                    |

---

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI (Floating MiniPlayer, Custom Drawer, ThemedText)
├── constants/           # Centralized Theme tokens and Layout metrics
├── hooks/               # useThemeColor, useSafeAreaInsets
├── navigation/          # Multilayered Stack and Drawer structure
├── redux/               # Global state with persistent slices
├── services/            # Audio Service (AudioPlayerService), API (axiosClient)
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
