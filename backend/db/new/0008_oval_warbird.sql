ALTER TABLE "notifications" DROP CONSTRAINT "notifications_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "task_id";