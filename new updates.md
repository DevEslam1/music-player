# GiG Player — Roadmap & Progress

---

## ✅ Recent Milestones (Completed)

| Feature | Description | Released |
|---|---|---|
| **Android Equalizer** | Native 5-band EQ bridge with presets and persistence | v2.7.0 |
| **Sync Lyrics** | Real-time lyrics tracking with tap-to-seek | v2.6.0 |
| **Native Sharing** | System share sheet integration | v2.6.0 |
| **Guest Mode** | Offline-only playback without authentication | v2.5.0 |
| **FlashList Migration** | 60FPS scrolling on large libraries | v2.4.0 |
| **Sleep Timer** | Customizable auto-stop timer | v2.4.0 |
| **Queue Management** | Drag-to-reorder, swipe-to-delete, "Play Next" | v2.4.0 |
| **Recently Played** | History tracking on the home screen | v2.4.0 |

---

## 🎧 Playback & Audio (Planned)

| Feature | Description | Priority |
|---|---|---|
| **Crossfade** | Smooth 2-5s crossfade between tracks for gapless listening | Medium |
| **Playback Speed** | 0.5x–2.0x speed control (useful for podcasts/audiobooks) | Low |
| **Audio Visualizer** | Real-time waveform visualizer on Now Playing screen | Medium |

---

## 🔍 Discovery & Library (Planned)

| Feature | Description | Priority |
|---|---|---|
| **Global Search** | Unified search across streaming + local library in one place | ⭐ High |
| **Most Played** | Auto-generated "Top 25" playlist based on play count | Medium |
| **Genre Browsing** | Extract genre from ID3 tags for local music, use API genres for streaming | Medium |
| **Smart Playlists** | Auto-updating playlists (e.g. "Recently Added", "Long Songs") | Low |

---

## ⚡ Performance Optimizations (Planned)

| Optimization | Description | Priority |
|---|---|---|
| **Image Prefetching** | Preload album art for the current queue using `expo-image` | Medium |
| **Memoized Selectors** | Advanced RTK selectors to minimize re-renders in large lists | Medium |
| **Debounced Scan Progress** | Batch Redux dispatches during local storage scanning | Low |
| **Lazy Screen Loading** | `React.lazy()` for heavy detail screens to reduce TTI | Low |

---

## 📱 Platform & Social (Planned)

| Feature | Description | Priority |
|---|---|---|
| **Home Screen Widgets** | Interactive widget for playback control | Medium |
| **Android Auto / CarPlay** | Native media controls for in-car playback | Low |
| **Import/Export** | M3U or JSON export for playlist portability | Low |

---

*Last Updated: May 14, 2026*
