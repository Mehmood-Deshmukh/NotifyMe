ALTER TABLE "notifications" DROP CONSTRAINT "notifications_timetable_id_timetables_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "timetable_id";