CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`session` text NOT NULL,
	`kind` text NOT NULL,
	`path` text NOT NULL,
	`product` text NOT NULL,
	`target` text NOT NULL,
	`country` text NOT NULL,
	`source` text NOT NULL,
	`device` text NOT NULL,
	`returning` integer DEFAULT 0 NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_time_idx` ON `analytics_events` (`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_session_idx` ON `analytics_events` (`session`);