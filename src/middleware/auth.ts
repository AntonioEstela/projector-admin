import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function verifyJWT(req: NextRequest) {
  console.log('Verifying JWT token: ', req);
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  console.log('Decoded token: ', decoded);
  if (!decoded) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 403 });
  }

  // If the token is valid, continue with the request
  (req as any).user = decoded;
}
