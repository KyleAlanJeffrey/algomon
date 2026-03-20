-- Track which YouTube channel each video belongs to
ALTER TABLE videos ADD COLUMN channel_name TEXT;
ALTER TABLE videos ADD COLUMN channel_url TEXT;
