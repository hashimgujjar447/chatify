import nodemailer from "nodemailer";

export async function sendMailNodemailer(
  email: string,
  subject: string,
  message: string
) {
  // Create transporter with your email service
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASSWORD, // Your email password or app password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"No Reply" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: message,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
