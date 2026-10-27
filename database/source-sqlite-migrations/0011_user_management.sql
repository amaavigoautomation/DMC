ALTER TABLE admin_sessions ADD COLUMN user_id text;
--> statement-breakpoint
CREATE TABLE admin_users (
 id text PRIMARY KEY NOT NULL, name text NOT NULL, email text NOT NULL, status text NOT NULL, permissions text NOT NULL, revision integer DEFAULT 1 NOT NULL, salt text, password_hash text, reset_hash text, reset_expires integer, created_at text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX admin_users_email_unique ON admin_users(email);
--> statement-breakpoint
CREATE TABLE admin_audit (id text PRIMARY KEY NOT NULL,actor text NOT NULL,event text NOT NULL,target text NOT NULL,created_at text NOT NULL);
