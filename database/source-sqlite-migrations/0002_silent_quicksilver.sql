CREATE TABLE `brochure_downloads` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`brochure` text NOT NULL,
	`title` text NOT NULL,
	`destination` text NOT NULL,
	`source` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brochure_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`countries` text NOT NULL,
	`users` text NOT NULL,
	`timing` text NOT NULL,
	`phone` text NOT NULL,
	`demo` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`session_hash` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brochure_leads_session_hash_unique` ON `brochure_leads` (`session_hash`);