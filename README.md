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

- 🔐 **Secure Authentication**: Elegant Login and Sign Up flows powered by JWT (JSON Web Tokens) with front-end validation (email format, 8+ character password) and disabled submit until all fields are complete.
- ☁️ **Cloud Sync**: All your Liked Songs, Playlists, and History are synchronized in real-time with the production backend.
- 🎵 **Hybrid Search Engine**: Instantly find tracks across your local Liked Songs and the entire global catalog, with quick "Add to Playlist" from results.
- 💊 **Floating Pill MiniPlayer**: A premium, safe-area-aware playback bar that stays accessible across all navigation screens.
- ❤️ **Smart Library**: Manage your favorite songs with backend-synced "Like" toggling. Favorites automatically appear on the Home screen.
- 📋 **Advanced Playlists**: Create, manage, browse, and delete playlists. View playlist contents, play individual tracks, and remove songs — all with cloud persistence.
- 🔁 **Playback Controls**: Repeat One (single track loop), Repeat All (queue loop), and Shuffle modes with clear visual indicators.
- 🎵 **Background Audio**: Music continues playing when the app is minimized or the screen is locked (iOS & Android).
- 🌓 **Sonic Noir Theming**: Full Dark and Light mode support with automatic System Status Bar icon synchronization.
- ⚙️ **Settings Hub**: Centralized settings for theme, language, terms of service, and support navigation.
- 🌍 **Multi-Language Ready**: Language selector with English active and Arabic (Coming Soon).
- 📞 **Contact & Support**: Dedicated Contact Us page with direct links to authors' GitHub profiles and email support.
- 📊 **User Insights**: A personalized Profile dashboard tracking your library growth and real account activity.
- 🚀 **Performance Optimized**: Robust singleton audio service with loading locks and authenticated streaming.

---

## 📱 Screens

| Screen              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| **Home**            | Recommendations, favorite songs, and suggestions         |
| **Search**          | Powerful hybrid search with quick add-to-playlist        |
| **Liked Songs**     | Your favorite tracks with cloud sync & loading indicator |
| **Playlists**       | Specialized collections with full CRUD operations        |
| **Playlist Detail** | Browse, play, and remove songs within a playlist         |
| **Now Playing**     | Full-screen playback with repeat, shuffle & add controls |
| **Profile**         | Real user statistics and account management              |
| **Settings**        | Theme toggle, language, terms of service, and about info |
| **Contact Us**      | Developer profiles and support email                     |
| **Language**        | Language selection (English / Arabic coming soon)        |
| **Terms**           | Application terms of service                             |
| **FAQ**             | Common questions with expandable answers                 |
| **Auth**            | Validated Login & SignUp with disabled-until-ready forms  |

---

## 🛠️ Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| **Language**   | TypeScript (Strict Typing)                             |
| **Core**       | React Native (Expo SDK)                                |
| **State**      | Redux Toolkit (Async Thunks for Backend Sync)          |
| **Audio**      | Expo-Audio (Background Playback + Authenticated URLs)  |
| **Networking** | Axios (w/ JWT Interceptors & Retry Logic)              |
| **Navigation** | React Navigation (Native Stack + Custom Drawer)        |
| **Storage**    | AsyncStorage (Safe Token & Local State Persistence)    |

---

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI (MiniPlayer, PlaylistPicker, Custom Drawer)
├── constants/           # Centralized Theme tokens and Layout metrics
├── hooks/               # useThemeColor, useSafeAreaInsets
├── navigation/          # Multilayered Stack and Drawer structure
├── redux/               # Global state with synced Async Thunks
├── services/            # Audio Service, Auth & Library API Services
└── screens/
    ├── Auth/            # Login & SignUp with validation
    ├── Home/            # Recommendations & Favorites
    ├── Library/         # Hybrid Search with add-to-playlist
    ├── LikedSongs/      # Cloud-synced favorites
    ├── Playlist/        # Playlist list & detail views
    ├── NowPlaying/      # Full player with repeat/shuffle
    ├── Profile/         # User dashboard
    ├── Settings/        # App configuration
    ├── Contact/         # Developer info & support
    ├── Language/        # Language selection
    ├── Legal/           # Terms of service
    └── FAQ/             # Frequently asked questions
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo Go](https://expo.dev/go) on your mobile device

### Installation & Execution

1. **Clone & Enter**:
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
   npx expo start -c
   ```

4. **Background Audio (Optional)**:
   To test background playback on a real device, create a development build:
   ```bash
   npx expo prebuild
   npx expo run:ios    # or run:android
   ```

---

## 👥 Authors

**Eslam** — [GitHub](https://github.com/DevEslam1)  
**Karima Mahmoud** — [GitHub](https://github.com/KarimaMahmoud626)
