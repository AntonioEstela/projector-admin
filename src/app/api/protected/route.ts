import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  const res = verifyJWT(req);
  if (res) return res;

  // Protected data logic
  return NextResponse.json({ message: 'Acceso a datos protegidos' });
}
