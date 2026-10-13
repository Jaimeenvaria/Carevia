const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.HOST || 'smtp.ethereal.email',
        service: process.env.SERVICE,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Boolean(process.env.SECURE) || false,
        auth: {
            user: process.env.USER || 'demo@patientra.health', 
            pass: process.env.PASS || 'demopassword'
        }
    });
};

const sendOTPEmail = async (email, name, otp) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.USER || '"Patientra Health" <no-reply@patientra.health>', 
            to: email,
            subject: "Patientra Health — Security Verification Code (OTP)",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f766e;">Patientra Health Verification</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Welcome to Patientra Health Digital Platform. Your single-use verification code is:</p>
                    <div style="background-color: #f0fdf4; border: 1px dashed #16a34a; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 15px; border-radius: 6px; color: #15803d; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">Patientra Health System &bull; Secure Authentication</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.warn("Email notification skipped or simulated:", err.message);
    }
};

const sendAppointmentConfirmation = async ({ email, patientName, doctorName, specialty, date, time, appointmentType }) => {
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.USER || '"Patientra Health" <no-reply@patientra.health>',
            to: email,
            subject: `Confirmed: Appointment with Dr. ${doctorName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #0f766e;">Appointment Confirmation</h2>
                    <p>Dear <strong>${patientName}</strong>,</p>
                    <p>Your healthcare appointment has been successfully scheduled.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Doctor:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">Dr. ${doctorName} (${specialty})</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Date & Time:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${date} at ${time}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${appointmentType === 'telehealth' ? 'Virtual Consultation' : 'In-Person Visit'}</td></tr>
                    </table>
                    <p>You can prepare for your visit using our AI Appointment Preparation tool on your patient portal.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.warn("Email confirmation skipped or simulated:", err.message);
    }
};

const sendAppointmentReminder = async ({ email, patientName, doctorName, date, time }) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.USER || '"Patientra Health" <no-reply@patientra.health>',
            to: email,
            subject: `Reminder: Upcoming Appointment with Dr. ${doctorName}`,
            html: `<p>Dear ${patientName}, reminder for your appointment on ${date} at ${time} with Dr. ${doctorName}.</p>`
        });
    } catch (err) {
        console.warn("Email reminder skipped:", err.message);
    }
};

const sendCancellationEmail = async ({ email, patientName, doctorName, date }) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.USER || '"Patientra Health" <no-reply@patientra.health>',
            to: email,
            subject: `Appointment Cancelled — Dr. ${doctorName}`,
            html: `<p>Dear ${patientName}, your appointment scheduled for ${date} with Dr. ${doctorName} has been cancelled.</p>`
        });
    } catch (err) {
        console.warn("Email cancellation skipped:", err.message);
    }
};

const sendFollowupEmail = async ({ email, patientName, doctorName, recommendations }) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.USER || '"Patientra Health" <no-reply@patientra.health>',
            to: email,
            subject: `Post-Visit Follow-Up — Patientra Health`,
            html: `<p>Dear ${patientName}, thank you for visiting Dr. ${doctorName}. ${recommendations}</p>`
        });
    } catch (err) {
        console.warn("Email follow-up skipped:", err.message);
    }
};

module.exports = {
    sendOTPEmail,
    sendAppointmentConfirmation,
    sendAppointmentReminder,
    sendCancellationEmail,
    sendFollowupEmail
};
