CREATE TABLE `destination_visibility` (
	`slug` text PRIMARY KEY NOT NULL,
	`visible` integer DEFAULT 1 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
