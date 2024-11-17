import nodemailer from 'nodemailer';
import User from '@/models/User';

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Generate a 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpires = Date.now() + 3600000; // Code valid for 1 hour
  await user.save();

  // Send reset email
  await sendResetEmail(email, resetCode);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
  },
});

export async function sendResetEmail(email: string, resetCode: number) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Reset your password</h1>
      <p>Use the following code to reset your password:</p>
      <h2>${resetCode}</h2>
      <p>If you didn't request a password reset, you can ignore this email.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}
