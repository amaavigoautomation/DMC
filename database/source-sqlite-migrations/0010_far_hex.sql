CREATE TABLE `email_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`event_key` text NOT NULL,
	`recipient` text NOT NULL,
	`trigger` text NOT NULL,
	`destination` text DEFAULT '' NOT NULL,
	`subject` text NOT NULL,
	`html` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_outbox_event_key_unique` ON `email_outbox` (`event_key`);--> statement-breakpoint
CREATE TABLE `email_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`secret` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`tested` text,
	`updated_at` text NOT NULL
);
