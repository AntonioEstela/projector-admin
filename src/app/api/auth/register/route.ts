import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  const { email, password, firstName, lastName } = await req.json();

  await dbConnect(); // Connect to db

  // Check if user is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'Usuario ya registrado' }, { status: 400 });
  }

  // Create and save new user
  const newUser = new User({ email, password, firstName, lastName });
  await newUser.save();

  return NextResponse.json({ message: 'Usuario registrado exitosamente' }, { status: 201 });
}
