const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send welcome email with login credentials
 */
const sendCredentialsEmail = async (toEmail, fullName, role, plainPassword) => {
  const mailOptions = {
    from: `"EasyDoc Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to EasyDoc - Your ${role.toUpperCase()} Account Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0d6efd;">Welcome to EasyDoc Portal!</h2>
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>An administrative account has been provisioned for you as a <strong>${role}</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Login Email:</strong> ${toEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="font-size: 16px; color: #d63384;">${plainPassword}</code></p>
        </div>

        <p>Please log in to your account and change your password as soon as possible.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #6c757d;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send 6-digit OTP for Password Reset
 */
const sendOTPEmail = async (toEmail, fullName, otp) => {
  const mailOptions = {
    from: `"EasyDoc Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Password Reset OTP - EasyDoc Portal`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0d6efd;">Password Reset Request</h2>
        <p>Hello <strong>${fullName || "User"}</strong>,</p>
        <p>We received a request to reset your password. Use the OTP code below to proceed:</p>
        
        <div style="background-color: #f8f9fa; text-align: center; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0d6efd;">${otp}</span>
        </div>

        <p style="color: #dc3545; font-size: 14px;">⚠️ This OTP is valid for <strong>5 minutes</strong> only.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendCredentialsEmail, sendOTPEmail };
