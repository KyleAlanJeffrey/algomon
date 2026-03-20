import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

export const videos = sqliteTable("videos", {
  url: text("url").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  username: text("username").notNull().default("default"),
  timesWatched: integer("times_watched").default(0).notNull(),
  timesSeen: integer("times_seen").default(1).notNull(),
  watchSeconds: integer("watch_seconds").default(0).notNull(),
  tags: text("tags").notNull().default("[]"),
})

export const words = sqliteTable("words", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  username: text("username").notNull().default("default"),
  videoUrls: text("video_urls").notNull().default("[]"), // JSON array
  timesWatched: integer("times_watched").default(0).notNull(),
  timesSeen: integer("times_seen").default(1).notNull(),
}, (table) => ({
  uniqueTextDateUsername: uniqueIndex("idx_words_unique").on(table.text, table.date, table.username),
}))

export const userVideoStats = sqliteTable("user_video_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().default("default"),
  date: text("date").notNull(),
  videoUrl: text("video_url").notNull(),
  source: text("source").notNull().default("home"), // "home" | "sidebar" | "shorts" | "watched"
  timesWatched: integer("times_watched").default(0).notNull(),
  timesSeen: integer("times_seen").default(1).notNull(),
  watchSeconds: integer("watch_seconds").default(0).notNull(),
}, (table) => ({
  uniqueUserDateVideoSource: uniqueIndex("idx_user_video_stats_unique").on(table.username, table.date, table.videoUrl, table.source),
}))

export const users = sqliteTable("users", {
  username: text("username").primaryKey(),
  name: text("name").notNull(),
})
