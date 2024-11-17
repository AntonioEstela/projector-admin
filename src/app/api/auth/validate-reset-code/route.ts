import { NextResponse } from 'next/server';
import User from '@/models/User';

export async function POST(req: Request) {
  const { email, resetCode } = await req.json();

  // Find the user by email and check if the code and expiration are valid
  const user = await User.findOne({
    email,
    resetPasswordCode: resetCode,
    resetPasswordExpires: { $gt: Date.now() }, // Code is still valid
  });

  console.log(Date.now(), resetCode, email);
  if (!user) {
    return NextResponse.json({ message: 'Invalid or expired reset code' }, { status: 400 });
  }

  // If code is valid, allow the user to proceed
  return NextResponse.json({ message: 'Reset code is valid' });
}
