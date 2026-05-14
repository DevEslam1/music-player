import { Track } from "../../types";

/**
 * LyricsService
 * 
 * Future implementation should fetch from an external API or the backend.
 * For now, it provides high-quality mock lyrics for demonstration.
 */
export interface LyricsLine {
  time: number; // in milliseconds
  text: string;
}

export const LyricsService = {
  getLyrics: async (track: Track): Promise<LyricsLine[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Sample timed lyrics with emojis for common tracks
    if (track.name.toLowerCase().includes("deira")) {
      return [
        { time: 0, text: "🎵 Welcome to Deira 🏙️" },
        { time: 3000, text: "✨ The heart of the city ❤️" },
        { time: 6000, text: "☀️ Where the sun never sets 🌇" },
        { time: 10000, text: "🚶‍♂️ Walking through the streets 🛣️" },
        { time: 13000, text: "🌶️ Smelling the spice in the air 💨" },
        { time: 16000, text: "📜 History in every corner 🏛️" },
        { time: 20000, text: "🤝 Memories we used to share 🫂" },
        { time: 24000, text: "🎸 Oh Deira, you're the one 🌟" },
        { time: 27000, text: "💎 Under the golden sun 🌞" },
        { time: 30000, text: "🏠 A place where we belong 🌍" },
      ];
    }

    if (track.name.toLowerCase().includes("very few friends")) {
      return [
        { time: 0, text: "🤫 I've got very few friends 👥" },
        { time: 4000, text: "💎 But they're all I need 💯" },
        { time: 8000, text: "🚫 I don't need the crowds 🙅‍♂️" },
        { time: 12000, text: "🌱 To plant a tiny seed ✨" },
        { time: 16000, text: "⭕ It's a small circle 🧿" },
        { time: 20000, text: "💪 But it's a strong one ⚡" },
        { time: 24000, text: "🎭 No room for the fake 🤡" },
        { time: 28000, text: "🌅 Until the day is done 🌑" },
      ];
    }

    // Fallback/Default synchronized lyrics
    return [
      { time: 0, text: "🎶 Instrumental Intro 🎸" },
      { time: 5000, text: "✨ This is where the magic happens 🪄" },
      { time: 10000, text: `📝 Lyrics for "${track.name}" 🎵` },
      { time: 15000, text: "🔄 Are being synchronized live... ⚡" },
      { time: 20000, text: "🌈 Music is the language of the soul 💖" },
      { time: 25000, text: "🧩 It makes us feel whole 🤝" },
      { time: 30000, text: "🚀 No matter where we go 🌎" },
      { time: 35000, text: "🌊 The rhythm starts to flow 💃" },
      { time: 40000, text: "✨ GiG Player Premium Vibes ✨" },
    ];
  }
};
