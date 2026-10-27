CREATE TABLE `blog_ordering` (
	`id` text PRIMARY KEY NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_revision` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text
);
