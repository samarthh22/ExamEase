import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/faculty - List faculty
router.get(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN', 'HOD', 'FACULTY']),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const faculty = await prisma.facultyMember.findMany({
        include: {
          user: {
            select: { id: true, email: true, fullName: true, active: true },
          },
          courses: {
            select: { id: true, courseCode: true, title: true },
          },
        },
        orderBy: { user: { fullName: 'asc' } },
      });

      res.json({ faculty });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch faculty list.' });
    }
  }
);

// POST /api/faculty - Create faculty member (Exam Admin, System Admin)
router.post(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, password, fullName, department, designation } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Email, password, and fullName are required.' });
      return;
    }

    try {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existingEmail) {
        res.status(409).json({ error: 'User with this email already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const faculty = await prisma.facultyMember.create({
        data: {
          department: department?.trim() || 'Computer Science & Engineering',
          designation: designation?.trim() || 'Assistant Professor',
          user: {
            create: {
              email: email.trim().toLowerCase(),
              passwordHash,
              fullName: fullName.trim(),
              role: 'FACULTY',
              active: true,
            },
          },
        },
        include: {
          user: { select: { id: true, email: true, fullName: true, active: true } },
        },
      });

      res.status(201).json({ message: 'Faculty member created successfully.', faculty });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create faculty member.' });
    }
  }
);

export default router;
