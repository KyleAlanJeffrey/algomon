-- Add watch_seconds to videos table
ALTER TABLE videos ADD COLUMN watch_seconds INTEGER NOT NULL DEFAULT 0;

-- Add source and watch_seconds to user_video_stats
ALTER TABLE user_video_stats ADD COLUMN source TEXT NOT NULL DEFAULT 'home';
ALTER TABLE user_video_stats ADD COLUMN watch_seconds INTEGER NOT NULL DEFAULT 0;
