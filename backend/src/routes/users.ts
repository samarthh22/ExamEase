import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken, requireRoles(['SYSTEM_ADMIN']));

// GET /api/users
router.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
      studentProfile: u.studentProfile,
      facultyProfile: u.facultyProfile,
    }));

    res.json({ users: sanitized });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// POST /api/users
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password, fullName, role, rollNumber, department, batchYear, designation } = req.body;

  if (!email || !password || !fullName || !role) {
    res.status(400).json({ error: 'Email, password, fullName, and role are required.' });
    return;
  }

  const validRoles = ['STUDENT', 'FACULTY', 'EXAM_ADMIN', 'HOD', 'SYSTEM_ADMIN'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (existing) {
      res.status(409).json({ error: 'A user with this email address already exists.' });
      return;
    }

    if (role === 'STUDENT' && !rollNumber) {
      res.status(400).json({ error: 'Roll number is required for students.' });
      return;
    }

    if (role === 'STUDENT' && rollNumber) {
      const existingRoll = await prisma.student.findUnique({
        where: { rollNumber: String(rollNumber).trim() },
      });
      if (existingRoll) {
        res.status(409).json({ error: 'A student with this roll number already exists.' });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        passwordHash,
        fullName: String(fullName).trim(),
        role,
        active: true,
        ...(role === 'STUDENT'
          ? {
              studentProfile: {
                create: {
                  rollNumber: String(rollNumber).trim(),
                  department: department ? String(department).trim() : 'Computer Science & Engineering',
                  batchYear: parseInt(batchYear, 10) || new Date().getFullYear(),
                },
              },
            }
          : {}),
        ...(role === 'FACULTY'
          ? {
              facultyProfile: {
                create: {
                  department: department ? String(department).trim() : 'Computer Science & Engineering',
                  designation: designation ? String(designation).trim() : 'Assistant Professor',
                },
              },
            }
          : {}),
      },
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        active: user.active,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (err: any) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { fullName, role, active, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = String(fullName).trim();
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = Boolean(active);
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        studentProfile: true,
        facultyProfile: true,
      },
    });

    res.json({
      message: 'User updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        active: updated.active,
        studentProfile: updated.studentProfile,
        facultyProfile: updated.facultyProfile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// PATCH /api/users/:id/status
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const { active } = req.body;

  if (active === undefined) {
    res.status(400).json({ error: 'Status "active" boolean is required.' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { active: Boolean(active) },
    });

    res.json({
      message: `User ${user.active ? 'activated' : 'deactivated'} successfully.`,
      active: user.active,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

export default router;
