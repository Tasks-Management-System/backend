import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const host = process.env.EMAIL_HOST || "smtp.gmail.com";
        const port = Number(process.env.EMAIL_PORT || 465);
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;

        if (!user || !pass) {
            throw new Error("EMAIL_USER and EMAIL_PASS are required");
        }

        const isGmail = host.includes("gmail.com");
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            service: isGmail ? "gmail" : undefined,
            requireTLS: port === 587,
            tls: {
                minVersion: "TLSv1.2",
            },
            auth: {
                user,
                pass,
            },
        })

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `Task Management System <${user}>`,
            to,
            subject,
            html,
        })

        console.log("Email sent successfully", {
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
        });
    } catch (error) {
        console.error("Error sending email", error);
        throw error;
    }
}