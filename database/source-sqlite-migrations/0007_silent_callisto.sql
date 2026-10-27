CREATE TABLE `demo_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`phone` text NOT NULL,
	`country` text NOT NULL,
	`destinations` text NOT NULL,
	`role` text NOT NULL,
	`users` text NOT NULL,
	`solutions` text NOT NULL,
	`software` text NOT NULL,
	`timing` text NOT NULL,
	`message` text NOT NULL,
	`source` text NOT NULL,
	`destination` text NOT NULL,
	`variant` text NOT NULL,
	`consent_at` text NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `demo_requested_idx` ON `demo_requests` (`created_at`);