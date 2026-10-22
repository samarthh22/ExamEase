import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'examease-super-secret-jwt-key-2026';

export interface AuthUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'EXAM_ADMIN' | 'HOD' | 'SYSTEM_ADMIN';
  fullName: string;
  studentId?: string;
  facultyId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      fullName: string;
    };

    // Verify active status in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    if (!dbUser || !dbUser.active) {
      res.status(401).json({ error: 'User account is inactive or no longer exists.' });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as AuthUser['role'],
      fullName: dbUser.fullName,
      studentId: dbUser.studentProfile?.id,
      facultyId: dbUser.facultyProfile?.id,
    };

    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
    return;
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: [${roles.join(', ')}]. Current role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
