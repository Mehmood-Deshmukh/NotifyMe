import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const templates = {
  taskReminder: (taskName, timeLeft) => ({
    subject: `Reminder: ${taskName} - ${timeLeft} remaining`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Task Reminder</h1>
            </div>
            <div class="content">
              <h2>Don't forget: ${taskName}</h2>
              <p>You have <strong>${timeLeft}</strong> remaining to complete this task.</p>
              <p>Stay focused and manage your time effectively!</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from your task management system.</p>
              <p>If you've already completed this task, you can ignore this message.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  taskCompleted: (taskName) => ({
    subject: `Task Completed: ${taskName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #28a745;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .success-icon {
              font-size: 48px;
              color: #28a745;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Task Completed</h1>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <h2>Great job!</h2>
              <p>The task "${taskName}" has been marked as completed.</p>
              <p>Keep up the excellent work!</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your task management system.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  upcomingClass: (className, timeSlot) => ({
    subject: `Upcoming Class: ${className}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #6366f1;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .class-info {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .time-badge {
              display: inline-block;
              background-color: #6366f1;
              color: white;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 14px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Class Reminder</h1>
            </div>
            <div class="content">
              <h2>Your next class is starting soon!</h2>
              <div class="class-info">
                <h3>${className}</h3>
                <p>Time: ${timeSlot}</p>
                <span class="time-badge">Starting in 5 minutes</span>
              </div>
              <p>Don't forget to:</p>
              <ul>
                <li>Have your materials ready</li>
                <li>Check your device's battery</li>
                <li>Find a quiet study space</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated notification from your timetable management system.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  timetableUploaded: (totalClasses) => ({
    subject: 'Timetable Successfully Uploaded',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #22c55e;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .success-icon {
              font-size: 48px;
              color: #22c55e;
              text-align: center;
              margin: 20px 0;
            }
            .stats {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Timetable Upload Successful</h1>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <h2>Your timetable has been uploaded!</h2>
              <div class="stats">
                <p>Total classes scheduled: ${totalClasses}</p>
                <p>Notifications have been set up for all your classes</p>
              </div>
              <p>You'll receive reminders 5 minutes before each class.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your timetable management system.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

const sendEmail = async ({ to, template, data }) => {
  try {
    let emailTemplate;
    if(template == 'timetableUploaded'){
        emailTemplate = templates[template](data.totalClasses);
    }else if(template == 'upcomingClass'){
        emailTemplate = templates[template](data.className, data.timeSlot);
    }else{
        emailTemplate = templates[template](data.taskName, data.timeLeft);
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;