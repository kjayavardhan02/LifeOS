import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    logger.warn('[Mailer] SMTP not configured, skipping email');
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'LifeOS <noreply@lifeos.local>',
    to,
    subject,
    html,
  });
  logger.info(`[Mailer] Sent email to ${to}: ${subject}`);
}
