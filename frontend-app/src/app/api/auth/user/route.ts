import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyJWT } from '@/middleware/auth';

export async function PUT(req: NextRequest) {
  verifyJWT(req);

  const { email, role } = await req.json();
  if (!['user', 'admin'].includes(role)) {
    return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
  }

  await dbConnect();

  // Find the user in the database
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
  }

  // Update the user's role
  user.role = role;
  await user.save();

  // Return the updated user information
  return NextResponse.json({
    message: 'Rol actualizado correctamente',
    userId: user._id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
}

export async function DELETE(req: NextRequest) {
  verifyJWT(req);

  const { email } = await req.json();

  await dbConnect();

  // Find the user in the database
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
  }

  // Delete the user
  await user.deleteOne();

  return NextResponse.json({ message: 'Usuario eliminado correctamente' });
}

export async function GET(req: NextRequest) {
  verifyJWT(req);

  await dbConnect();

  // Get all users from the database
  const users = await User.find({}, { password: 0 });

  return NextResponse.json(users);
}
