# Database dictionary

MySQL 8.4 / InnoDB. Application tables: 17. `schema_migrations` is added by the migration runner. Source JSON is intentionally stored as LONGTEXT. Timestamps retain the source representation; no timezone reinterpretation occurs on import.

## admin_audit

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `actor` | LONGTEXT | No | — |
| `event` | LONGTEXT | No | — |
| `target` | LONGTEXT | No | — |
| `created_at` | VARCHAR(32) | No | — |

Indexes: Primary key only.

## admin_login_limits

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `bucket` (PK) | VARCHAR(191) | No | — |
| `attempts` | BIGINT | No | 0 |
| `reset_at` | BIGINT | No | — |

Indexes: Primary key only.

## admin_sessions

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `token_hash` (PK) | VARCHAR(191) | No | — |
| `actor` | LONGTEXT | No | — |
| `expires_at` | BIGINT | No | — |
| `last_seen` | BIGINT | No | — |
| `credential_version` | LONGTEXT | No | — |
| `user_id` | LONGTEXT | Yes | — |

Indexes: Primary key only.

## admin_users

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `name` | LONGTEXT | No | — |
| `email` | VARCHAR(254) | No | — |
| `status` | LONGTEXT | No | — |
| `permissions` | LONGTEXT | No | — |
| `revision` | BIGINT | No | 1 |
| `salt` | LONGTEXT | Yes | — |
| `password_hash` | LONGTEXT | Yes | — |
| `reset_hash` | LONGTEXT | Yes | — |
| `reset_expires` | BIGINT | Yes | — |
| `created_at` | VARCHAR(32) | No | — |

Indexes: Unique admin_users_email_unique (email)

## analytics_events

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `visitor` | LONGTEXT | No | — |
| `session` | VARCHAR(191) | No | — |
| `kind` | LONGTEXT | No | — |
| `path` | LONGTEXT | No | — |
| `product` | LONGTEXT | No | — |
| `target` | LONGTEXT | No | — |
| `country` | LONGTEXT | No | — |
| `source` | LONGTEXT | No | — |
| `device` | LONGTEXT | No | — |
| `returning` | BIGINT | No | 0 |
| `occurred_at` | VARCHAR(32) | No | — |

Indexes: analytics_session_idx (session); analytics_time_idx (occurred_at)

## blog_media

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `mime` | LONGTEXT | No | — |
| `created_at` | VARCHAR(32) | No | — |

Indexes: Primary key only.

## blog_ordering

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `draft` | LONGTEXT | No | — |
| `published` | LONGTEXT | Yes | — |
| `revision` | BIGINT | No | 1 |
| `published_revision` | BIGINT | No | 0 |
| `updated_at` | VARCHAR(32) | No | — |
| `published_at` | VARCHAR(32) | Yes | — |

Indexes: Primary key only.

## blog_posts

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `slug` | VARCHAR(254) | No | — |
| `draft` | LONGTEXT | No | — |
| `published` | LONGTEXT | Yes | — |
| `revision` | BIGINT | No | 1 |
| `published_revision` | BIGINT | No | 0 |
| `state` | VARCHAR(1024) | No | 'draft' |
| `updated_at` | VARCHAR(32) | No | — |
| `published_at` | VARCHAR(32) | Yes | — |

Indexes: Unique blog_posts_slug_unique (slug)

## blog_state

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |

Indexes: Primary key only.

## brochure_downloads

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `lead_id` | LONGTEXT | No | — |
| `brochure` | LONGTEXT | No | — |
| `title` | LONGTEXT | No | — |
| `destination` | LONGTEXT | No | — |
| `source` | LONGTEXT | No | — |
| `created_at` | VARCHAR(32) | No | — |

Indexes: Primary key only.

## brochure_leads

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `name` | LONGTEXT | No | — |
| `email` | VARCHAR(254) | No | — |
| `company` | LONGTEXT | No | — |
| `countries` | LONGTEXT | No | — |
| `users` | LONGTEXT | No | — |
| `timing` | LONGTEXT | No | — |
| `phone` | LONGTEXT | No | — |
| `demo` | BIGINT | No | 0 |
| `created_at` | VARCHAR(32) | No | — |
| `session_hash` | VARCHAR(254) | No | — |
| `expires_at` | LONGTEXT | No | — |

Indexes: Unique brochure_leads_session_hash_unique (session_hash)

## country_pricing

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `slug` (PK) | VARCHAR(191) | No | — |
| `draft` | LONGTEXT | No | — |
| `published` | LONGTEXT | Yes | — |
| `revision` | BIGINT | No | 0 |
| `published_revision` | BIGINT | No | 0 |
| `updated_by` | LONGTEXT | No | — |
| `updated_at` | VARCHAR(32) | No | — |
| `published_at` | VARCHAR(32) | Yes | — |
| `setup_draft` | LONGTEXT | Yes | — |
| `setup_published` | LONGTEXT | Yes | — |

Indexes: Primary key only.

## demo_requests

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `name` | LONGTEXT | No | — |
| `email` | VARCHAR(254) | No | — |
| `company` | LONGTEXT | No | — |
| `phone` | LONGTEXT | No | — |
| `country` | LONGTEXT | No | — |
| `destinations` | LONGTEXT | No | — |
| `role` | LONGTEXT | No | — |
| `users` | LONGTEXT | No | — |
| `solutions` | LONGTEXT | No | — |
| `software` | LONGTEXT | No | — |
| `timing` | LONGTEXT | No | — |
| `message` | LONGTEXT | No | — |
| `source` | LONGTEXT | No | — |
| `destination` | LONGTEXT | No | — |
| `variant` | LONGTEXT | No | — |
| `consent_at` | VARCHAR(32) | No | — |
| `created_at` | VARCHAR(32) | No | — |
| `status` | VARCHAR(1024) | No | 'New' |
| `revision` | BIGINT | No | 1 |

Indexes: demo_requested_idx (created_at)

## destination_visibility

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `slug` (PK) | VARCHAR(191) | No | — |
| `visible` | BIGINT | No | 1 |
| `revision` | BIGINT | No | 1 |
| `updated_by` | LONGTEXT | No | — |
| `updated_at` | VARCHAR(32) | No | — |

Indexes: Primary key only.

## email_outbox

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `event_key` | VARCHAR(512) | No | — |
| `recipient` | LONGTEXT | No | — |
| `trigger` | LONGTEXT | No | — |
| `destination` | VARCHAR(1024) | No | '' |
| `subject` | LONGTEXT | No | — |
| `html` | LONGTEXT | No | — |
| `status` | LONGTEXT | No | — |
| `attempts` | BIGINT | No | 0 |
| `detail` | VARCHAR(1024) | No | '' |
| `created_at` | VARCHAR(32) | No | — |
| `updated_at` | VARCHAR(32) | No | — |

Indexes: Unique email_outbox_event_key_unique (event_key)

## email_settings

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `id` (PK) | VARCHAR(191) | No | — |
| `value` | LONGTEXT | No | — |
| `secret` | LONGTEXT | Yes | — |
| `revision` | BIGINT | No | 1 |
| `tested` | LONGTEXT | Yes | — |
| `updated_at` | VARCHAR(32) | No | — |

Indexes: Primary key only.

## page_seo

| Column | MySQL type | Nullable | Default |
|---|---|---|---|
| `slug` (PK) | VARCHAR(191) | No | — |
| `draft` | LONGTEXT | No | — |
| `published` | LONGTEXT | Yes | — |
| `revision` | BIGINT | No | 0 |
| `published_revision` | BIGINT | No | 0 |
| `updated_by` | LONGTEXT | No | — |
| `updated_at` | VARCHAR(32) | No | — |
| `published_at` | VARCHAR(32) | Yes | — |

Indexes: Primary key only.
