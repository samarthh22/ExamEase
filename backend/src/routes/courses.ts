import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/courses - Available to all authenticated roles
router.get('/', authenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        assignedFaculty: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            examSchedules: true,
          },
        },
      },
      orderBy: { courseCode: 'asc' },
    });

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// GET /api/courses/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        assignedFaculty: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
        examSchedules: true,
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    res.json({ course });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch course details.' });
  }
});

// POST /api/courses - EXAM_ADMIN or SYSTEM_ADMIN
router.post(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { courseCode, title, credits, department, assignedFacultyId } = req.body;

    if (!courseCode || !title || credits === undefined || !department) {
      res.status(400).json({ error: 'Course code, title, credits, and department are required.' });
      return;
    }

    try {
      const existing = await prisma.course.findUnique({
        where: { courseCode: String(courseCode).trim().toUpperCase() },
      });
      if (existing) {
        res.status(409).json({ error: `Course code "${courseCode}" already exists.` });
        return;
      }

      if (assignedFacultyId) {
        const faculty = await prisma.facultyMember.findUnique({ where: { id: String(assignedFacultyId) } });
        if (!faculty) {
          res.status(400).json({ error: 'Assigned faculty member not found.' });
          return;
        }
      }

      const course = await prisma.course.create({
        data: {
          courseCode: String(courseCode).trim().toUpperCase(),
          title: String(title).trim(),
          credits: parseInt(credits, 10),
          department: String(department).trim(),
          assignedFacultyId: assignedFacultyId ? String(assignedFacultyId) : null,
        },
        include: {
          assignedFaculty: {
            include: { user: { select: { fullName: true, email: true } } },
          },
        },
      });

      res.status(201).json({ message: 'Course created successfully.', course });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create course.' });
    }
  }
);

// PUT /api/courses/:id - EXAM_ADMIN or SYSTEM_ADMIN
router.put(
  '/:id',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { courseCode, title, credits, department, assignedFacultyId, active } = req.body;

    try {
      const existing = await prisma.course.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const updateData: any = {};
      if (courseCode !== undefined) updateData.courseCode = String(courseCode).trim().toUpperCase();
      if (title !== undefined) updateData.title = String(title).trim();
      if (credits !== undefined) updateData.credits = parseInt(credits, 10);
      if (department !== undefined) updateData.department = String(department).trim();
      if (assignedFacultyId !== undefined) updateData.assignedFacultyId = assignedFacultyId ? String(assignedFacultyId) : null;
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await prisma.course.update({
        where: { id },
        data: updateData,
        include: {
          assignedFaculty: {
            include: { user: { select: { fullName: true, email: true } } },
          },
        },
      });

      res.json({ message: 'Course updated successfully.', course: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update course.' });
    }
  }
);

// POST /api/courses/:id/enroll - Enroll a student
router.post(
  '/:id/enroll',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const courseId = String(req.params.id);
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({ error: 'studentId is required.' });
      return;
    }

    try {
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const student = await prisma.student.findUnique({ where: { id: String(studentId) } });
      if (!student) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId: String(studentId), courseId },
        },
      });

      if (existingEnrollment) {
        res.status(409).json({ error: 'Student is already enrolled in this course.' });
        return;
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: String(studentId),
          courseId,
        },
      });

      res.status(201).json({ message: 'Student enrolled successfully.', enrollment });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to enroll student.' });
    }
  }
);

// DELETE /api/courses/:id/enroll/:studentId - Remove enrollment
router.delete(
  '/:id/enroll/:studentId',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const courseId = String(req.params.id);
    const studentId = String(req.params.studentId);

    try {
      await prisma.enrollment.delete({
        where: {
          studentId_courseId: { studentId, courseId },
        },
      });

      res.json({ message: 'Enrollment removed successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to remove enrollment.' });
    }
  }
);

export default router;
