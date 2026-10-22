import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/students
router.get(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN', 'FACULTY', 'HOD']),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const students = await prisma.student.findMany({
        include: {
          user: {
            select: { id: true, email: true, fullName: true, active: true },
          },
          enrollments: {
            include: {
              course: {
                select: { id: true, courseCode: true, title: true },
              },
            },
          },
          _count: {
            select: {
              registrations: true,
              results: true,
            },
          },
        },
        orderBy: { rollNumber: 'asc' },
      });

      res.json({ students });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch students.' });
    }
  }
);

// POST /api/students
router.post(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { email, password, fullName, rollNumber, department, batchYear } = req.body;

    if (!email || !password || !fullName || !rollNumber) {
      res.status(400).json({ error: 'Email, password, fullName, and rollNumber are required.' });
      return;
    }

    try {
      const existingEmail = await prisma.user.findUnique({
        where: { email: String(email).trim().toLowerCase() },
      });
      if (existingEmail) {
        res.status(409).json({ error: 'User with this email already exists.' });
        return;
      }

      const existingRoll = await prisma.student.findUnique({
        where: { rollNumber: String(rollNumber).trim() },
      });
      if (existingRoll) {
        res.status(409).json({ error: 'Student with this roll number already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const student = await prisma.student.create({
        data: {
          rollNumber: String(rollNumber).trim(),
          department: department ? String(department).trim() : 'Computer Science & Engineering',
          batchYear: parseInt(batchYear, 10) || new Date().getFullYear(),
          user: {
            create: {
              email: String(email).trim().toLowerCase(),
              passwordHash,
              fullName: String(fullName).trim(),
              role: 'STUDENT',
              active: true,
            },
          },
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, active: true },
          },
        },
      });

      res.status(201).json({ message: 'Student created successfully.', student });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create student.' });
    }
  }
);

// PUT /api/students/:id
router.put(
  '/:id',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { fullName, rollNumber, department, batchYear } = req.body;

    try {
      const existing = await prisma.student.findUnique({
        where: { id },
        include: { user: true },
      });
      if (!existing) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      if (rollNumber && String(rollNumber).trim() !== existing.rollNumber) {
        const rollConflict = await prisma.student.findUnique({
          where: { rollNumber: String(rollNumber).trim() },
        });
        if (rollConflict) {
          res.status(409).json({ error: 'Roll number already in use.' });
          return;
        }
      }

      const updated = await prisma.student.update({
        where: { id },
        data: {
          ...(rollNumber ? { rollNumber: String(rollNumber).trim() } : {}),
          ...(department ? { department: String(department).trim() } : {}),
          ...(batchYear ? { batchYear: parseInt(batchYear, 10) } : {}),
          ...(fullName
            ? {
                user: {
                  update: {
                    fullName: String(fullName).trim(),
                  },
                },
              }
            : {}),
        },
        include: {
          user: { select: { id: true, email: true, fullName: true, active: true } },
        },
      });

      res.json({ message: 'Student updated successfully.', student: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update student.' });
    }
  }
);

export default router;
