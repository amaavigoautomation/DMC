CREATE TABLE `country_pricing` (
	`slug` text PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`published_revision` integer DEFAULT 0 NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text
);
