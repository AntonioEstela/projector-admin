import { requestPasswordReset } from '@/lib/emailService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await requestPasswordReset(email);
    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error sending reset email' }, { status: 500 });
  }
}
