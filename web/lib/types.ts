export interface Video {
  url: string
  title: string
  imageUrl: string | null
  username: string
  timesWatched: number
  timesSeen: number
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
}
