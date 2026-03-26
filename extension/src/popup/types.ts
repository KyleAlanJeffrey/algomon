export const API_BASE = process.env.API_BASE || "https://algomon.app";

export interface Credentials {
  username: string;
  name: string;
  apiSecret: string;
}

export interface User {
  username: string;
  name: string;
}

export interface WordData {
  text: string;
  timesSeen: number;
}

export interface WordsResponse {
  videoMetrics: { totalVideos: number };
  wordData: WordData[];
}
