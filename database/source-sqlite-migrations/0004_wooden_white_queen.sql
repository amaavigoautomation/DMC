CREATE TABLE `admin_login_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`expires_at` integer NOT NULL,
	`last_seen` integer NOT NULL,
	`credential_version` text NOT NULL
);
