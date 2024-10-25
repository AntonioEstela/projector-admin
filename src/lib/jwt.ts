import jwt from 'jsonwebtoken';

// Generate a JWT token
export function signToken(payload: object) {
  return jwt.sign(payload, process.env.NEXT_PUBLIC_JWT_SECRET as string, { expiresIn: '1h' }); // Token expires in 1 hour
}

// Verify a JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string);
  } catch (error) {
    console.error('Error verifying token: ', error);
    return null; // If token is invalid, returns null
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode the token without verifying it
    const decoded = jwt.decode(token) as { exp: number } | null;

    if (!decoded || !decoded.exp) {
      return true; // Invalid token or no expiration claim
    }

    // Get the current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the token has expired
    return decoded.exp < currentTime;
  } catch (error) {
    return true; // If there's an error decoding, treat the token as expired
  }
};
