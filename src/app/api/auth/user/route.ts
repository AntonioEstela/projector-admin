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
