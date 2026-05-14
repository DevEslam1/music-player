## [2.7.0] — 2026-05-14

### Added & Optimized
- **Android Audio Equalizer**: Implemented a native 5-band equalizer bridge for precise audio frequency control on Android.
- **EQ Presets**: Integrated 12 standard presets (Bass Boost, Pop, Rock, Classical, Jazz, etc.) with custom user controls.
- **State Persistence**: Equalizer state (band levels, presets, power status) is fully persisted across app sessions via Redux and `AsyncStorage`.
- **Native Session Tracking**: Robust logic to automatically attach/detach the native Equalizer effect to the active media session.
- **Refined EQ UI**: Premium, theme-responsive modal with custom slider components and real-time gain indicators.

---

## [2.6.0] — 2026-05-14

### Added & Optimized
- **Synchronized Lyrics**: Real-time line-by-line lyrics highlighting with auto-scroll and interactive "tap-to-seek" functionality.
- **Native Sharing**: Integrated system-level share sheet for seamless sharing of tracks and artist profiles.
- **UI Persistence**: The app now remembers and restores your lyrics visibility preference across restarts.
- **Performance**: Optimized lyrics rendering and haptic feedback loops for smoother interaction.

---

## [2.5.0] — 2026-05-13

### Added & Optimized
- **Guest Mode**: Full offline mode allowing users to browse and play downloaded/local music without signing in. Hidden cloud-only UI elements when in this mode.
- **Persistent Sessions**: Implemented `AsyncStorage` user hydration for instant app entry, and updated the API client to remain resilient against network timeouts (no longer forcing logout on poor connections).
- **FlashList Migration**: Upgraded `LikedSongs`, `Downloads`, and `Playlist` screens to `@shopify/flash-list` for blazing-fast 60fps scrolling on large libraries.
- **Queue Management**: Added swipe-to-remove functionality in the Queue screen.

---

## [2.4.0] — 2026-05-13

### Added & Optimized
- **Local Music Scan Filters**: Added advanced filtering controls in Settings to exclude specific folders, filter by minimum file size (0–5 MB), and filter by minimum duration (0–120s).
- **Excluded Folders Modal**: New interactive modal to browse and toggle device folders for scanning.
- **Dynamic Rescanning**: Automatic library refresh when scan filters or exclusions are modified.
- **Visual Placeholders**: Implemented a "Background Icon" pattern across all track lists, ensuring a themed musical icon is visible during loading or if artwork is missing.
- **Metadata Sanitization**: Robust error handling and size-gating for ID3 artwork (base64) to prevent system rejections of large metadata payloads.

---

## [2.3.0] — 2026-04-29

### Added & Optimized
- **MiniPlayer Gestures**: Swiping down transforms the MiniPlayer into a compact, rotating CD layout.
- **Interactive Dragging**: The compact CD can be swiped freely across the screen horizontally with physics-based edge snapping.
- **Fluid Layout**: Smooth interpolated animations seamlessly reverting back to the expanded layout.

---

## [2.2.0] — 2026-04-28

### Added & Optimized
- **System Theming**: Robust automatic dark mode syncing with system preferences.
- **Theme Synchronization**: Implemented a system theme listener to sync Redux state with Expo's `userInterfaceStyle`.
- **Platform Refinements**: Disabled Android's forced dark mode to prevent styling conflicts.

---

## [2.1.0] — 2026-04-28

### Added & Optimized
- **Performance**: Granular Redux selectors and memoization to cut re-renders by ~2x. Added carousel windowing.
- **Premium UI**: Floating curved Drawer, pill SearchBar with blur, and MiniPlayer color ghosting.
- **Access**: Auth-restricted downloads and improved startup persistence.
- **Theme**: Full system-based light/dark mode support.

### Improved & Fixed
- **Stability**: Fixed critical hook violations and like-toggle race conditions.
- **Startup**: Reworked navigation to conditional stacks for smoother bootstrap.
- **Cleanup**: Guarded search queries and purged redundant code/AsyncStorage writes.
- **Layout**: Unified vertical rhythm and touch targets across all screens.

---

## [2.0.0] — 2026-04-27

### Added
- **Offline**: Track downloading with bulk options, progress tracking, and MB usage summary.
- **Banner System**: Replaced all alerts with a unified global notification banner.
- **Gestures**: MiniPlayer swipe-to-skip and long-press scrubbing with haptic feedback.
- **Connectivity**: Real-time offline detection and direct "Downloads" FAB.
- **Visuals**: Music-reactive breathing art and dynamic accent glow on Now Playing.

### Improved & Fixed
- **Navigation**: Resolved registration conflicts and moved sub-screens to native stack.
- **Auth**: Silent token refresh and unified expiry warnings.
- **Core**: Fixed circular dependencies, memory leaks, and 500ms Android audio delay.

---

## [1.0.0] — Initial Release
- Infinite suggestion feed and custom auth splash.
- Modular architecture with junior-friendly documentation.
- High-frequency state isolation for progress bars.
