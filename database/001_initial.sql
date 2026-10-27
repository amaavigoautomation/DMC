-- DMC24 website schema for MySQL 8.4. Run against a new, empty database.

-- InnoDB; UTC ISO timestamps retained as strings for round-trip fidelity.

SET NAMES utf8mb4;

CREATE TABLE `admin_audit` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `actor` LONGTEXT NOT NULL,
  `event` LONGTEXT NOT NULL,
  `target` LONGTEXT NOT NULL,
  `created_at` VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `admin_login_limits` (
  `bucket` VARCHAR(191) NOT NULL PRIMARY KEY,
  `attempts` BIGINT NOT NULL DEFAULT 0,
  `reset_at` BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `admin_sessions` (
  `token_hash` VARCHAR(191) NOT NULL PRIMARY KEY,
  `actor` LONGTEXT NOT NULL,
  `expires_at` BIGINT NOT NULL,
  `last_seen` BIGINT NOT NULL,
  `credential_version` LONGTEXT NOT NULL,
  `user_id` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `admin_users` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `status` LONGTEXT NOT NULL,
  `permissions` LONGTEXT NOT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `salt` LONGTEXT NULL,
  `password_hash` LONGTEXT NULL,
  `reset_hash` LONGTEXT NULL,
  `reset_expires` BIGINT NULL,
  `created_at` VARCHAR(32) NOT NULL,
  UNIQUE KEY `admin_users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `analytics_events` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `visitor` LONGTEXT NOT NULL,
  `session` VARCHAR(191) NOT NULL,
  `kind` LONGTEXT NOT NULL,
  `path` LONGTEXT NOT NULL,
  `product` LONGTEXT NOT NULL,
  `target` LONGTEXT NOT NULL,
  `country` LONGTEXT NOT NULL,
  `source` LONGTEXT NOT NULL,
  `device` LONGTEXT NOT NULL,
  `returning` BIGINT NOT NULL DEFAULT 0,
  `occurred_at` VARCHAR(32) NOT NULL,
  KEY `analytics_session_idx` (`session`),
  KEY `analytics_time_idx` (`occurred_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `blog_media` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `mime` LONGTEXT NOT NULL,
  `created_at` VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `blog_ordering` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `draft` LONGTEXT NOT NULL,
  `published` LONGTEXT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `published_revision` BIGINT NOT NULL DEFAULT 0,
  `updated_at` VARCHAR(32) NOT NULL,
  `published_at` VARCHAR(32) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `blog_posts` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(254) NOT NULL,
  `draft` LONGTEXT NOT NULL,
  `published` LONGTEXT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `published_revision` BIGINT NOT NULL DEFAULT 0,
  `state` VARCHAR(1024) NOT NULL DEFAULT 'draft',
  `updated_at` VARCHAR(32) NOT NULL,
  `published_at` VARCHAR(32) NULL,
  UNIQUE KEY `blog_posts_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `blog_state` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `brochure_downloads` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `lead_id` LONGTEXT NOT NULL,
  `brochure` LONGTEXT NOT NULL,
  `title` LONGTEXT NOT NULL,
  `destination` LONGTEXT NOT NULL,
  `source` LONGTEXT NOT NULL,
  `created_at` VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `brochure_leads` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `company` LONGTEXT NOT NULL,
  `countries` LONGTEXT NOT NULL,
  `users` LONGTEXT NOT NULL,
  `timing` LONGTEXT NOT NULL,
  `phone` LONGTEXT NOT NULL,
  `demo` BIGINT NOT NULL DEFAULT 0,
  `created_at` VARCHAR(32) NOT NULL,
  `session_hash` VARCHAR(254) NOT NULL,
  `expires_at` LONGTEXT NOT NULL,
  UNIQUE KEY `brochure_leads_session_hash_unique` (`session_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `country_pricing` (
  `slug` VARCHAR(191) NOT NULL PRIMARY KEY,
  `draft` LONGTEXT NOT NULL,
  `published` LONGTEXT NULL,
  `revision` BIGINT NOT NULL DEFAULT 0,
  `published_revision` BIGINT NOT NULL DEFAULT 0,
  `updated_by` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(32) NOT NULL,
  `published_at` VARCHAR(32) NULL,
  `setup_draft` LONGTEXT NULL,
  `setup_published` LONGTEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `demo_requests` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` LONGTEXT NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `company` LONGTEXT NOT NULL,
  `phone` LONGTEXT NOT NULL,
  `country` LONGTEXT NOT NULL,
  `destinations` LONGTEXT NOT NULL,
  `role` LONGTEXT NOT NULL,
  `users` LONGTEXT NOT NULL,
  `solutions` LONGTEXT NOT NULL,
  `software` LONGTEXT NOT NULL,
  `timing` LONGTEXT NOT NULL,
  `message` LONGTEXT NOT NULL,
  `source` LONGTEXT NOT NULL,
  `destination` LONGTEXT NOT NULL,
  `variant` LONGTEXT NOT NULL,
  `consent_at` VARCHAR(32) NOT NULL,
  `created_at` VARCHAR(32) NOT NULL,
  `status` VARCHAR(1024) NOT NULL DEFAULT 'New',
  `revision` BIGINT NOT NULL DEFAULT 1,
  KEY `demo_requested_idx` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `destination_visibility` (
  `slug` VARCHAR(191) NOT NULL PRIMARY KEY,
  `visible` BIGINT NOT NULL DEFAULT 1,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `updated_by` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `email_outbox` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `event_key` VARCHAR(512) NOT NULL,
  `recipient` LONGTEXT NOT NULL,
  `trigger` LONGTEXT NOT NULL,
  `destination` VARCHAR(1024) NOT NULL DEFAULT '',
  `subject` LONGTEXT NOT NULL,
  `html` LONGTEXT NOT NULL,
  `status` LONGTEXT NOT NULL,
  `attempts` BIGINT NOT NULL DEFAULT 0,
  `detail` VARCHAR(1024) NOT NULL DEFAULT '',
  `created_at` VARCHAR(32) NOT NULL,
  `updated_at` VARCHAR(32) NOT NULL,
  UNIQUE KEY `email_outbox_event_key_unique` (`event_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `email_settings` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `value` LONGTEXT NOT NULL,
  `secret` LONGTEXT NULL,
  `revision` BIGINT NOT NULL DEFAULT 1,
  `tested` LONGTEXT NULL,
  `updated_at` VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

CREATE TABLE `page_seo` (
  `slug` VARCHAR(191) NOT NULL PRIMARY KEY,
  `draft` LONGTEXT NOT NULL,
  `published` LONGTEXT NULL,
  `revision` BIGINT NOT NULL DEFAULT 0,
  `published_revision` BIGINT NOT NULL DEFAULT 0,
  `updated_by` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(32) NOT NULL,
  `published_at` VARCHAR(32) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
