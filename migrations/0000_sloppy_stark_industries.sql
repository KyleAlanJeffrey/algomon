CREATE TABLE `user_video_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text DEFAULT 'default' NOT NULL,
	`date` text NOT NULL,
	`video_url` text NOT NULL,
	`times_watched` integer DEFAULT 0 NOT NULL,
	`times_seen` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`url` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`image_url` text,
	`username` text DEFAULT 'default' NOT NULL,
	`times_watched` integer DEFAULT 0 NOT NULL,
	`times_seen` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`date` text NOT NULL,
	`username` text DEFAULT 'default' NOT NULL,
	`video_urls` text DEFAULT '[]' NOT NULL,
	`times_watched` integer DEFAULT 0 NOT NULL,
	`times_seen` integer DEFAULT 1 NOT NULL
);
