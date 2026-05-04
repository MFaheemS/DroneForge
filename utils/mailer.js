const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, name, resetUrl) {
  await transporter.sendMail({
    from: `"DroneForge" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Reset your DroneForge password',
    html: `
      <div style="font-family: sans-serif; background: #0a0a0f; color: #e0e0e0; padding: 40px; border-radius: 8px;">
        <h1 style="color: #00f5ff; font-family: monospace;">DroneForge</h1>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click below within <strong>15 minutes</strong>:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#00f5ff;color:#0a0a0f;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#888;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendPasswordResetEmail };
