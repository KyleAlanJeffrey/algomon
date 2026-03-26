-- Deduplicate video URLs that differ only by tracking params (e.g. &pp=...).
-- Canonical form: https://www.youtube.com/watch?v=ID  or  https://www.youtube.com/shorts/ID
--
-- Strategy: create clean tables, INSERT aggregated rows, swap.

-- ============================================================
-- 1. videos  (PK = url)
-- ============================================================

-- Helper: extract canonical URL.  SQLite doesn't have regex, but we can use
-- substr/instr to strip everything after &  for watch URLs.
-- For non-watch URLs we keep as-is (shorts don't usually get extra params).

CREATE TABLE videos_clean AS
SELECT
  -- canonical url: strip anything after the first '&'
  CASE
    WHEN url LIKE '%youtube.com/watch?v=%' THEN
      CASE
        WHEN INSTR(url, '&') > 0 THEN SUBSTR(url, 1, INSTR(url, '&') - 1)
        ELSE url
      END
    WHEN url LIKE '%youtube.com/shorts/%' THEN
      CASE
        WHEN INSTR(url, '?') > 0 THEN SUBSTR(url, 1, INSTR(url, '?') - 1)
        ELSE url
      END
    ELSE url
  END AS url,
  -- Keep the title from the row with the most times_seen (most authoritative)
  title,
  image_url,
  username,
  SUM(times_watched) AS times_watched,
  SUM(times_seen) AS times_seen,
  SUM(watch_seconds) AS watch_seconds,
  -- Merge tags: just keep the longest tags array (most complete)
  tags,
  channel_name,
  channel_url,
  channel_avatar_url
FROM (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY
        CASE
          WHEN url LIKE '%youtube.com/watch?v=%' THEN
            CASE WHEN INSTR(url, '&') > 0 THEN SUBSTR(url, 1, INSTR(url, '&') - 1) ELSE url END
          WHEN url LIKE '%youtube.com/shorts/%' THEN
            CASE WHEN INSTR(url, '?') > 0 THEN SUBSTR(url, 1, INSTR(url, '?') - 1) ELSE url END
          ELSE url
        END
      ORDER BY times_seen DESC
    ) AS rn
  FROM videos
)
WHERE rn = 1
GROUP BY
  CASE
    WHEN url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(url, '&') > 0 THEN SUBSTR(url, 1, INSTR(url, '&') - 1) ELSE url END
    WHEN url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(url, '?') > 0 THEN SUBSTR(url, 1, INSTR(url, '?') - 1) ELSE url END
    ELSE url
  END;

DROP TABLE videos;
ALTER TABLE videos_clean RENAME TO videos;

-- ============================================================
-- 2. user_video_stats  (unique: username, date, video_url, source)
-- ============================================================

CREATE TABLE user_video_stats_clean AS
SELECT
  NULL AS id,
  username,
  date,
  CASE
    WHEN video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(video_url, '&') > 0 THEN SUBSTR(video_url, 1, INSTR(video_url, '&') - 1) ELSE video_url END
    WHEN video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(video_url, '?') > 0 THEN SUBSTR(video_url, 1, INSTR(video_url, '?') - 1) ELSE video_url END
    ELSE video_url
  END AS video_url,
  source,
  SUM(times_watched) AS times_watched,
  SUM(times_seen) AS times_seen,
  SUM(watch_seconds) AS watch_seconds
FROM user_video_stats
GROUP BY
  username, date,
  CASE
    WHEN video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(video_url, '&') > 0 THEN SUBSTR(video_url, 1, INSTR(video_url, '&') - 1) ELSE video_url END
    WHEN video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(video_url, '?') > 0 THEN SUBSTR(video_url, 1, INSTR(video_url, '?') - 1) ELSE video_url END
    ELSE video_url
  END,
  source;

DROP TABLE user_video_stats;
ALTER TABLE user_video_stats_clean RENAME TO user_video_stats;

-- Re-create the autoincrement id (SQLite requires recreating the table for proper AUTOINCREMENT)
-- The NULL AS id trick above gives us the rows; now rebuild with proper schema:

CREATE TABLE user_video_stats_final (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL DEFAULT 'default',
  date TEXT NOT NULL,
  video_url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'home',
  times_watched INTEGER NOT NULL DEFAULT 0,
  times_seen INTEGER NOT NULL DEFAULT 1,
  watch_seconds INTEGER NOT NULL DEFAULT 0
);

INSERT INTO user_video_stats_final (username, date, video_url, source, times_watched, times_seen, watch_seconds)
SELECT username, date, video_url, source, times_watched, times_seen, watch_seconds
FROM user_video_stats;

DROP TABLE user_video_stats;
ALTER TABLE user_video_stats_final RENAME TO user_video_stats;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_stats_unique
  ON user_video_stats (username, date, video_url, source);

-- ============================================================
-- 3. video_recommendations  (unique: recommended_video_url, from_video_url, username, date)
-- ============================================================

CREATE TABLE video_recommendations_clean (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommended_video_url TEXT NOT NULL,
  from_video_url TEXT NOT NULL,
  username TEXT NOT NULL,
  date TEXT NOT NULL,
  times_seen INTEGER NOT NULL DEFAULT 1
);

INSERT INTO video_recommendations_clean (recommended_video_url, from_video_url, username, date, times_seen)
SELECT
  CASE
    WHEN recommended_video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(recommended_video_url, '&') > 0 THEN SUBSTR(recommended_video_url, 1, INSTR(recommended_video_url, '&') - 1) ELSE recommended_video_url END
    WHEN recommended_video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(recommended_video_url, '?') > 0 THEN SUBSTR(recommended_video_url, 1, INSTR(recommended_video_url, '?') - 1) ELSE recommended_video_url END
    ELSE recommended_video_url
  END,
  CASE
    WHEN from_video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(from_video_url, '&') > 0 THEN SUBSTR(from_video_url, 1, INSTR(from_video_url, '&') - 1) ELSE from_video_url END
    WHEN from_video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(from_video_url, '?') > 0 THEN SUBSTR(from_video_url, 1, INSTR(from_video_url, '?') - 1) ELSE from_video_url END
    ELSE from_video_url
  END,
  username,
  date,
  SUM(times_seen)
FROM video_recommendations
GROUP BY
  CASE
    WHEN recommended_video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(recommended_video_url, '&') > 0 THEN SUBSTR(recommended_video_url, 1, INSTR(recommended_video_url, '&') - 1) ELSE recommended_video_url END
    WHEN recommended_video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(recommended_video_url, '?') > 0 THEN SUBSTR(recommended_video_url, 1, INSTR(recommended_video_url, '?') - 1) ELSE recommended_video_url END
    ELSE recommended_video_url
  END,
  CASE
    WHEN from_video_url LIKE '%youtube.com/watch?v=%' THEN
      CASE WHEN INSTR(from_video_url, '&') > 0 THEN SUBSTR(from_video_url, 1, INSTR(from_video_url, '&') - 1) ELSE from_video_url END
    WHEN from_video_url LIKE '%youtube.com/shorts/%' THEN
      CASE WHEN INSTR(from_video_url, '?') > 0 THEN SUBSTR(from_video_url, 1, INSTR(from_video_url, '?') - 1) ELSE from_video_url END
    ELSE from_video_url
  END,
  username,
  date;

DROP TABLE video_recommendations;
ALTER TABLE video_recommendations_clean RENAME TO video_recommendations;

CREATE UNIQUE INDEX IF NOT EXISTS idx_video_recommendations_unique
  ON video_recommendations (recommended_video_url, from_video_url, username, date);

-- ============================================================
-- 4. words — normalize URLs inside the video_urls JSON arrays
-- ============================================================
-- For each word row, extract URLs via json_each, normalize each one
-- (strip everything after & for watch URLs, after ? for shorts),
-- then rebuild the array with DISTINCT.

UPDATE words SET video_urls = (
  SELECT json_group_array(DISTINCT normalized_url)
  FROM (
    SELECT
      CASE
        WHEN value LIKE '%youtube.com/watch?v=%' THEN
          CASE WHEN INSTR(value, '&') > 0 THEN SUBSTR(value, 1, INSTR(value, '&') - 1) ELSE value END
        WHEN value LIKE '%youtube.com/shorts/%' THEN
          CASE WHEN INSTR(value, '?') > 0 THEN SUBSTR(value, 1, INSTR(value, '?') - 1) ELSE value END
        ELSE value
      END AS normalized_url
    FROM json_each(words.video_urls)
  )
);
