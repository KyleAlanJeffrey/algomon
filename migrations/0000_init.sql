-- Full schema for Algomon (flattened from migrations 0000–0007)

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS videos (
  url TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  username TEXT NOT NULL DEFAULT 'default',
  times_watched INTEGER NOT NULL DEFAULT 0,
  times_seen INTEGER NOT NULL DEFAULT 1,
  watch_seconds INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  channel_name TEXT,
  channel_url TEXT,
  channel_avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  date TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT 'default',
  video_urls TEXT NOT NULL DEFAULT '[]',
  times_watched INTEGER NOT NULL DEFAULT 0,
  times_seen INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_words_unique
  ON words (text, date, username);

CREATE TABLE IF NOT EXISTS user_video_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL DEFAULT 'default',
  date TEXT NOT NULL,
  video_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'home',
  times_watched INTEGER NOT NULL DEFAULT 0,
  times_clicked INTEGER NOT NULL DEFAULT 0,
  times_seen INTEGER NOT NULL DEFAULT 1,
  watch_seconds INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_stats_unique
  ON user_video_stats (username, date, video_url, source);

CREATE TABLE IF NOT EXISTS video_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommended_video_url TEXT NOT NULL,
  from_video_url TEXT NOT NULL,
  username TEXT NOT NULL,
  date TEXT NOT NULL,
  times_seen INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_video_recommendations_unique
  ON video_recommendations (recommended_video_url, from_video_url, username, date);
