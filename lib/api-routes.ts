/**
 * API route reference — all endpoints in one place.
 * Import helpers from here rather than hardcoding paths.
 */

export const apiRoutes = {
  // Extension ingest (POST only, requires X-API-Key header)
  videos: "/api/videos",

  // Users
  users: "/api/users",
  user: (username: string) => `/api/users/${username}`,

  // Per-user resources
  userVideos: (username: string) => `/api/users/${username}/videos`,
  userWords: (username: string, params?: { date?: string; month?: string; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.date) q.set("date", params.date)
    if (params?.month) q.set("month", params.month)
    if (params?.limit != null) q.set("limit", String(params.limit))
    const qs = q.toString()
    return `/api/users/${username}/words${qs ? `?${qs}` : ""}`
  },

  // Per-user stats
  userStatsDaily: (username: string) => `/api/users/${username}/stats/daily`,
  userStatsDayOfWeek: (username: string) => `/api/users/${username}/stats/day-of-week`,
  userStatsTagsDistribution: (username: string) => `/api/users/${username}/stats/tags-distribution`,
  userStatsVideoRecurrence: (username: string) => `/api/users/${username}/stats/video-recurrence`,
  userStatsWordTrends: (username: string, top = 6) =>
    `/api/users/${username}/stats/word-trends?top=${top}`,
  userStatsSourceDistribution: (username: string) =>
    `/api/users/${username}/stats/source-distribution`,
  userStatsChannels: (username: string) =>
    `/api/users/${username}/stats/channels`,
  userStatsRecommendationGraph: (username: string) =>
    `/api/users/${username}/stats/recommendation-graph`,

  // Data management
  userData: (username: string) => `/api/users/${username}/data`, // DELETE to wipe
} as const
