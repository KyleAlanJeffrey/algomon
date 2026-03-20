-- Track which video a sidebar recommendation came from (many-to-many)
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
