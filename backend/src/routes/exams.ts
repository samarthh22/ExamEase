import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { checkVenueConflict } from '../utils/conflictChecker.js';

const router = Router();

// GET /api/exams - List examination schedules
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { user } = req;
  if (!user) {
    res.status(401).json({ error: 'Unauthenticated.' });
    return;
  }

  try {
    let whereClause: any = {};

    if (user.role === 'STUDENT') {
      if (!user.studentId) {
        res.status(403).json({ error: 'Student profile not found.' });
        return;
      }
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.studentId },
        select: { courseId: true },
      });
      const enrolledCourseIds = enrollments.map(e => e.courseId);

      whereClause = {
        courseId: { in: enrolledCourseIds },
        status: { not: 'DRAFT' },
      };
    } else if (user.role === 'FACULTY') {
      if (user.facultyId) {
        whereClause = {
          course: { assignedFacultyId: user.facultyId },
        };
      }
    }

    const exams = await prisma.examSchedule.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            assignedFaculty: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
        _count: {
          select: {
            registrations: true,
            marks: true,
            results: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json({ exams });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch examinations.' });
  }
});

// POST /api/exams/check-conflict
router.post('/check-conflict', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { date, startTime, endTime, venue, excludeExamId } = req.body;

  if (!date || !startTime || !endTime || !venue) {
    res.status(400).json({ error: 'date, startTime, endTime, and venue are required.' });
    return;
  }

  const result = await checkVenueConflict({
    date: String(date),
    startTime: String(startTime),
    endTime: String(endTime),
    venue: String(venue),
    excludeExamId: excludeExamId ? String(excludeExamId) : undefined,
  });

  res.json(result);
});

// GET /api/exams/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  try {
    const exam = await prisma.examSchedule.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            assignedFaculty: {
              include: { user: { select: { id: true, fullName: true, email: true } } },
            },
          },
        },
        gradingBoundaries: {
          orderBy: { lowerBound: 'asc' },
        },
        registrations: {
          include: {
            student: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
        marks: {
          include: {
            student: {
              include: {
                user: { select: { fullName: true } },
              },
            },
          },
        },
        results: true,
      },
    });

    if (!exam) {
      res.status(404).json({ error: 'Examination schedule not found.' });
      return;
    }

    res.json({ exam });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch examination details.' });
  }
});

// POST /api/exams
router.post(
  '/',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { courseId, examType, date, startTime, endTime, venue, maxMarks, status } = req.body;

    if (!courseId || !examType || !date || !startTime || !endTime || !venue) {
      res.status(400).json({
        error: 'courseId, examType, date, startTime, endTime, and venue are required.',
      });
      return;
    }

    try {
      const course = await prisma.course.findUnique({ where: { id: String(courseId) } });
      if (!course) {
        res.status(404).json({ error: 'Course not found.' });
        return;
      }

      const conflictCheck = await checkVenueConflict({
        date: String(date),
        startTime: String(startTime),
        endTime: String(endTime),
        venue: String(venue),
      });

      if (conflictCheck.hasConflict) {
        res.status(409).json({
          error: conflictCheck.message,
          conflictingExam: conflictCheck.conflictingExam,
        });
        return;
      }

      const exam = await prisma.examSchedule.create({
        data: {
          courseId: String(courseId),
          examType: String(examType).trim().toUpperCase(),
          date: String(date).trim(),
          startTime: String(startTime).trim(),
          endTime: String(endTime).trim(),
          venue: String(venue).trim(),
          maxMarks: maxMarks ? parseFloat(maxMarks) : 100.0,
          status: status || 'PUBLISHED',
        },
        include: {
          course: true,
        },
      });

      res.status(201).json({ message: 'Examination scheduled successfully.', exam });
    } catch (err: any) {
      console.error('Create exam error:', err);
      res.status(500).json({ error: 'Failed to schedule examination.' });
    }
  }
);

// PUT /api/exams/:id
router.put(
  '/:id',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { courseId, examType, date, startTime, endTime, venue, maxMarks, status } = req.body;

    try {
      const existing = await prisma.examSchedule.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Examination schedule not found.' });
        return;
      }

      const newDate = date ? String(date).trim() : existing.date;
      const newStart = startTime ? String(startTime).trim() : existing.startTime;
      const newEnd = endTime ? String(endTime).trim() : existing.endTime;
      const newVenue = venue ? String(venue).trim() : existing.venue;

      const conflictCheck = await checkVenueConflict({
        date: newDate,
        startTime: newStart,
        endTime: newEnd,
        venue: newVenue,
        excludeExamId: id,
      });

      if (conflictCheck.hasConflict) {
        res.status(409).json({
          error: conflictCheck.message,
          conflictingExam: conflictCheck.conflictingExam,
        });
        return;
      }

      const updated = await prisma.examSchedule.update({
        where: { id },
        data: {
          ...(courseId ? { courseId: String(courseId) } : {}),
          ...(examType ? { examType: String(examType).trim().toUpperCase() } : {}),
          date: newDate,
          startTime: newStart,
          endTime: newEnd,
          venue: newVenue,
          ...(maxMarks !== undefined ? { maxMarks: parseFloat(maxMarks) } : {}),
          ...(status ? { status: String(status) } : {}),
        },
        include: {
          course: true,
        },
      });

      res.json({ message: 'Examination updated successfully.', exam: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update examination.' });
    }
  }
);

// PATCH /api/exams/:id/cancel
router.patch(
  '/:id/cancel',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);

    try {
      const exam = await prisma.examSchedule.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      res.json({ message: 'Examination cancelled successfully.', exam });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to cancel examination.' });
    }
  }
);

export default router;
