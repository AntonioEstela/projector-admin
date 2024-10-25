import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const { email, password }: LoginRequest = await req.json();
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return NextResponse.json({ message: 'Credenciales incorrectas' }, { status: 401 });
  }
}
