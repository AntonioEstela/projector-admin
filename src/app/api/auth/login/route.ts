import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await dbConnect();

  // Find the user in the database
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
  }

  // Compare the provided password with the stored hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  console.log(password, user.password, isMatch);
  if (!isMatch) {
    return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
  }

  // Generate JWT token
  const token = signToken({ userId: user._id });

  // Return the token to the client
  return NextResponse.json({
    token,
    userId: user._id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
}
