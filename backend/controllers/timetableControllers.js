import { timetables, notifications, tasks, users } from '../drizzle/schema.js';
import db from '../config/db.js';
import { eq } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';
import cron from 'node-cron';
import { scheduleNotification } from '../services/cronService.js';
import { promises as fs } from 'fs';
import sendEmail from '../services/emailService.js';

const activeSchedules = new Map();

export const getTimetables = async (req, res) => {
    try {
        const userTimetables = await db
            .select()
            .from(timetables)
            .where(eq(timetables.userId, req.user.id));
        res.json({ timetables: userTimetables });
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({ error: 'Failed to fetch timetables' });
    }
};

export const uploadTimetable = async (req, res) => {
    if (!req.files || !req.files.timetable) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.timetable;
    if (file.mimetype !== 'text/csv') {
        return res.status(400).json({ error: 'File must be a CSV' });
    }

    try {

        const fileContent = await fs.readFile(file.tempFilePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });

        if (!validateTimetableStructure(records)) {
            return res.status(400).json({ error: 'Invalid timetable format' });
        }

        const scheduleData = transformToScheduleData(records);


        const [newTimetable] = await db.insert(timetables).values({
            userId: req.user.id,
            fileData: fileContent,
            scheduleData: scheduleData
        }).returning();


        scheduleClassNotifications(newTimetable, req.user.id);

        await fs.unlink(file.tempFilePath);

        res.status(201).json({ timetable: newTimetable });
    } catch (error) {
        console.error('Error uploading timetable:', error);

        if (file.tempFilePath) {
            try {
                await fs.unlink(file.tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Failed to upload timetable' });
    }
};

export const updateTimetable = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (req.files && req.files.timetable) {
            const file = req.files.timetable;
            if (file.mimetype !== 'text/csv') {
                return res.status(400).json({ error: 'File must be a CSV' });
            }

            const fileContent = await fs.readFile(file.tempFilePath, 'utf-8');
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });

            if (!validateTimetableStructure(records)) {
                return res.status(400).json({ error: 'Invalid timetable format' });
            }

            const scheduleData = transformToScheduleData(records);

            cancelTimetableSchedules(parseInt(id));

            const [updatedTimetable] = await db.update(timetables)
                .set({
                    fileData: fileContent,
                    scheduleData: scheduleData,
                    updatedAt: new Date()
                })
                .where(eq(timetables.id, parseInt(id)))
                .returning();

            if (!updatedTimetable) {
                return res.status(404).json({ error: 'Timetable not found' });
            }


            scheduleClassNotifications(updatedTimetable, req.user.id);

            await fs.unlink(file.tempFilePath);

            res.json({ timetable: updatedTimetable });
        } else {
            res.status(400).json({ error: 'No file provided for update' });
        }
    } catch (error) {
        console.error('Error updating timetable:', error);
        if (req.files?.timetable?.tempFilePath) {
            try {
                await fs.unlink(req.files.timetable.tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        res.status(500).json({ error: 'Failed to update timetable' });
    }
};

export const deleteTimetable = async (req, res) => {
    const { id } = req.params;
    try {
        cancelTimetableSchedules(parseInt(id));

        const [deletedTimetable] = await db.delete(timetables)
            .where(eq(timetables.id, parseInt(id)))
            .returning();

        if (!deletedTimetable) {
            return res.status(404).json({ error: 'Timetable not found' });
        }

        res.json({ message: 'Timetable deleted successfully' });
    } catch (error) {
        console.error('Error deleting timetable:', error);
        res.status(500).json({ error: 'Failed to delete timetable' });
    }
};

const scheduleClassNotifications = async (timetable, userId) => {
    const schedule = timetable.scheduleData;
    const days = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5
    };

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const userEmail = user.email;

    let totalClasses = 0;

    Object.entries(schedule).forEach(([day, classes]) => {
        totalClasses += classes.length;
        classes.forEach(async (classInfo) => {
            const [startHour, startMinute] = classInfo.time.split('-')[0].trim().split(':').map(Number);
            

            let notificationMinute = startMinute - 5;
            let notificationHour = startHour;
  
            if (notificationMinute < 0) {
                notificationMinute = 55 + notificationMinute; 
                notificationHour = notificationHour - 1;
                
                
                if (notificationHour < 0) {
                    notificationHour = 23;
                }
            }
            
            const cronPattern = `${notificationMinute} ${notificationHour} * * ${days[day]}`;
            
            const job = cron.schedule(cronPattern, async () => {
                try {

                    await sendEmail({
                        to: userEmail,
                        template: 'upcomingClass',
                        data: {
                            className: classInfo.subject,
                            timeSlot: classInfo.time
                        }
                    });
        
                    await db.insert(notifications).values({
                        userId: userId,
                        timetableId: timetable.id,
                        title: `Upcoming Class: ${classInfo.subject}`,
                        description: `Your ${classInfo.subject} class starts in 5 minutes (${classInfo.time})`,
                        status: 'PENDING',
                        isRead: false,
                        sentAt: new Date()  
                    });

                    const [newTask] = await db.insert(tasks).values({
                        userId: userId,
                        taskName: `Attend ${classInfo.subject} class`,
                        dueDate: new Date(), 
                        isCompleted: false
                    }).returning();

                    await scheduleNotification(newTask);

                } catch (error) {
                    console.error('Error creating class notification:', error);
                }
            });


            const scheduleKey = `${timetable.id}-${day}-${classInfo.time}`;
            activeSchedules.set(scheduleKey, job);
        });
    });

    await sendEmail({
        to: userEmail,
        template: 'timetableUploaded',
        data: {
            totalClasses
        }
    });
};


const cancelTimetableSchedules = (timetableId) => {
    for (const [key, job] of activeSchedules.entries()) {
        if (key.startsWith(`${timetableId}-`)) {
            job.stop();
            activeSchedules.delete(key);
        }
    }
};

const validateTimetableStructure = (records) => {
    if (records.length === 0) return false;
    
    const requiredColumns = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const headers = Object.keys(records[0]);
    
    return requiredColumns.every(col => headers.includes(col));
};

const transformToScheduleData = (records) => {
    const schedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
    };

    records.forEach(record => {
        const timeSlot = record.Time;
        delete record.Time;

        Object.entries(record).forEach(([day, subject]) => {
            if (subject && subject.trim()) {
                schedule[day].push({
                    time: timeSlot,
                    subject: subject.trim()
                });
            }
        });
    });

    return schedule;
};

export const getActiveSchedules = async (req, res) => {
    try {
        const userTimetables = await db
            .select()
            .from(timetables)
            .where(eq(timetables.userId, req.user.id));

        const activeSchedulesList = userTimetables.map(timetable => {
            const schedules = Object.entries(timetable.scheduleData)
                .map(([day, classes]) => ({
                    day,
                    classes: classes.map(c => ({
                        ...c,
                        notificationScheduled: activeSchedules.has(`${timetable.id}-${day}-${c.time}`)
                    }))
                }));
            return {
                timetableId: timetable.id,
                schedules
            };
        });

        res.json({ activeSchedules: activeSchedulesList });
    } catch (error) {
        console.error('Error fetching active schedules:', error);
        res.status(500).json({ error: 'Failed to fetch active schedules' });
    }
};