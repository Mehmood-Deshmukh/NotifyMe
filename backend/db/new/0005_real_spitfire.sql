ALTER TABLE "notifications" ADD COLUMN "timetable_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_time" timestamp NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_timetable_id_timetables_id_fk" FOREIGN KEY ("timetable_id") REFERENCES "public"."timetables"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
