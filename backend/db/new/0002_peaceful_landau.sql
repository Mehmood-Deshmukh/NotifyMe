ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "updated_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "created_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "timetables" ALTER COLUMN "created_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "timetables" ALTER COLUMN "updated_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT 'now()';