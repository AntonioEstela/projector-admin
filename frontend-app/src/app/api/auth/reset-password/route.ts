import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
  const { email, resetCode, newPassword } = await req.json();

  dbConnect();
  // Validate the reset code and expiration one more time for security
  const user = await User.findOne({
    email,
    resetPasswordCode: resetCode,
    resetPasswordExpires: { $gt: Date.now() }, // Ensure code is still valid
  });

  if (!user) {
    return NextResponse.json({ message: 'Invalid or expired reset code' }, { status: 400 });
  }

  user.password = newPassword;
  user.resetPasswordCode = undefined; // Clear the reset code
  user.resetPasswordExpires = undefined; // Clear the expiration timestamp
  await user.save();

  return NextResponse.json({ message: 'Password successfully reset' });
}
