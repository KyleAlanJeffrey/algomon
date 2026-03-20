export interface Video {
  url: string
  title: string
  imageUrl: string | null
  username: string
  timesWatched: number
  timesSeen: number
  watchSeconds: number
}

export interface Word {
  text: string
  date: string
  username: string
  videoUrls: string[]
  timesWatched: number
  timesSeen: number
}

export interface WordsResponse {
  videoMetrics: { totalVideos: number }
  wordData: Word[]
}

// Payload from Chrome extension
export interface VideoPayload {
  url: string
  title: string
  imageUrl?: string
  date?: string
  username?: string
  name?: string
  tags?: string[]
  source?: "home" | "sidebar" | "shorts" // recommendation source
  watched?: boolean                        // first watch event — increments timesWatched
  watchUpdate?: boolean                    // subsequent update — only adds watchSeconds
  watchSeconds?: number                    // seconds to add
  watchPercent?: number                    // 0-100
  channelName?: string                      // e.g. "Bub Games"
  channelUrl?: string                      // e.g. "https://www.youtube.com/@BubGames"
  recommendedFrom?: string                 // URL of the video being watched when this was recommended in sidebar
}
