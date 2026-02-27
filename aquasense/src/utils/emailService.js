// utils/emailService.js
// Handles all outgoing emails: OTP login + password reset

const nodemailer = require('nodemailer');

// Create reusable transporter
// Uses Gmail by default - works with any SMTP provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS    // Gmail App Password (NOT your real password)
  }
});

/**
 * Send OTP email for login
 */
async function sendOTPEmail(toEmail, otp, username) {
  const mailOptions = {
    from: `"AquaSense AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your AquaSense AI Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a73e8;">AquaSense AI</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Your one-time login code is:</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a73e8;">${otp}</span>
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(toEmail, username, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"AquaSense AI" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'AquaSense AI - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a73e8;">AquaSense AI</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #1a73e8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Reset My Password
          </a>
        </div>
        <p>Or copy this link into your browser:</p>
        <p style="word-break: break-all; color: #1a73e8; font-size: 13px;">${resetUrl}</p>
        <p>This link expires in <strong>30 minutes</strong>.</p>
        <p style="color: #999; font-size: 12px;">If you did not request a password reset, please ignore this email. Your password will not change.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail, sendPasswordResetEmail };