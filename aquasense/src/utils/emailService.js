const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmail(toEmail, otp, username) {
  await resend.emails.send({
    from: `AquaSense AI <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Your AquaSense AI Login OTP',
    html: `
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your one-time login code is:</p>
      <h2 style="letter-spacing: 4px;">${otp}</h2>
      <p>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
    `
  });
}

async function sendPasswordResetEmail(toEmail, username, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: `AquaSense AI <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Reset your AquaSense AI password',
    html: `
      <p>Hello <strong>${username}</strong>,</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 30 minutes.</p>
    `
  });
}

module.exports = { sendOTPEmail, sendPasswordResetEmail };