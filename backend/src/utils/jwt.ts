import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.jwt.secret) as JWTPayload;
};

export default { generateToken, verifyToken };
