-- Add unique indexes to enable ON CONFLICT DO UPDATE (eliminates SELECT-before-upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_stats_unique
  ON user_video_stats (username, date, video_url, source);

CREATE UNIQUE INDEX IF NOT EXISTS idx_words_unique
  ON words (text, date, username);
