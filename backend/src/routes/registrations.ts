import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/registrations/eligible-exams
router.get(
  '/eligible-exams',
  authenticateToken,
  requireRoles(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = req.user?.studentId;

    if (!studentId) {
      res.status(403).json({ error: 'Student profile not associated with this account.' });
      return;
    }

    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: {
            include: {
              assignedFaculty: {
                include: { user: { select: { fullName: true } } },
              },
            },
          },
        },
      });

      const enrolledCourseIds = enrollments.map(e => e.courseId);

      const exams = await prisma.examSchedule.findMany({
        where: {
          courseId: { in: enrolledCourseIds },
        },
        include: {
          course: {
            include: {
              assignedFaculty: {
                include: { user: { select: { fullName: true } } },
              },
            },
          },
          registrations: {
            where: { studentId },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      });

      const mapped = exams.map(exam => {
        const registration = exam.registrations[0] || null;
        const isRegistered = !!registration && registration.status === 'REGISTERED';
        const isCancelled = exam.status === 'CANCELLED';
        const isPublished = exam.status === 'PUBLISHED';
        const isEligible = !isCancelled && isPublished && !isRegistered;

        let reasonIneligible = '';
        if (isCancelled) {
          reasonIneligible = 'Examination schedule is cancelled.';
        } else if (!isPublished) {
          reasonIneligible = 'Examination schedule is in draft state and not yet published for registration.';
        } else if (isRegistered) {
          reasonIneligible = 'Already registered for this examination.';
        }

        return {
          examId: exam.id,
          courseCode: exam.course.courseCode,
          courseTitle: exam.course.title,
          credits: exam.course.credits,
          facultyName: exam.course.assignedFaculty?.user.fullName || 'Unassigned',
          examType: exam.examType,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          venue: exam.venue,
          maxMarks: exam.maxMarks,
          status: exam.status,
          isRegistered,
          isEligible,
          reasonIneligible,
          registrationId: registration?.id || null,
          registrationTimestamp: registration?.registrationTimestamp || null,
        };
      });

      res.json({ eligibleExams: mapped });
    } catch (err: any) {
      console.error('Fetch eligible exams error:', err);
      res.status(500).json({ error: 'Failed to fetch eligible examinations.' });
    }
  }
);

// GET /api/registrations/my-registrations
router.get(
  '/my-registrations',
  authenticateToken,
  requireRoles(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = req.user?.studentId;

    if (!studentId) {
      res.status(403).json({ error: 'Student profile not associated with this account.' });
      return;
    }

    try {
      const registrations = await prisma.registration.findMany({
        where: { studentId },
        include: {
          examSchedule: {
            include: {
              course: {
                include: {
                  assignedFaculty: {
                    include: { user: { select: { fullName: true } } },
                  },
                },
              },
            },
          },
        },
        orderBy: { registrationTimestamp: 'desc' },
      });

      res.json({ registrations });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
  }
);

// POST /api/registrations
router.post(
  '/',
  authenticateToken,
  requireRoles(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = req.user?.studentId;
    const { examId } = req.body;

    if (!studentId) {
      res.status(403).json({ error: 'Forbidden: Only authenticated students can register for examinations.' });
      return;
    }

    if (!examId) {
      res.status(400).json({ error: 'examId is required.' });
      return;
    }

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: String(examId) },
        include: {
          course: true,
        },
      });

      if (!exam) {
        res.status(404).json({ error: 'Examination schedule not found.' });
        return;
      }

      if (exam.status === 'CANCELLED') {
        res.status(400).json({
          error: `Cannot register: Examination for ${exam.course.courseCode} (${exam.course.title}) has been cancelled.`,
        });
        return;
      }

      if (exam.status !== 'PUBLISHED') {
        res.status(400).json({
          error: `Cannot register: Examination schedule for ${exam.course.courseCode} is not currently open for registration (status: ${exam.status}).`,
        });
        return;
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId: exam.courseId,
          },
        },
      });

      if (!enrollment) {
        res.status(403).json({
          error: `Ineligible: You are not enrolled in ${exam.course.courseCode} (${exam.course.title}). Only enrolled students can register for this examination.`,
        });
        return;
      }

      const existingReg = await prisma.registration.findUnique({
        where: {
          studentId_examId: {
            studentId,
            examId: String(examId),
          },
        },
      });

      if (existingReg) {
        if (existingReg.status === 'REGISTERED') {
          res.status(409).json({
            error: `Duplicate registration: You are already registered for the ${exam.examType} examination of ${exam.course.courseCode}.`,
          });
          return;
        } else {
          const reactivated = await prisma.registration.update({
            where: { id: existingReg.id },
            data: { status: 'REGISTERED', registrationTimestamp: new Date() },
          });
          res.status(200).json({
            message: `Registration successfully reinstated for ${exam.course.courseCode} (${exam.course.title}).`,
            registration: reactivated,
          });
          return;
        }
      }

      const newRegistration = await prisma.registration.create({
        data: {
          studentId,
          examId: String(examId),
          status: 'REGISTERED',
        },
        include: {
          examSchedule: {
            include: {
              course: true,
            },
          },
        },
      });

      res.status(201).json({
        message: `Successfully registered for ${exam.course.courseCode} (${exam.course.title}) ${exam.examType} examination!`,
        registration: newRegistration,
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Server error occurred during examination registration.' });
    }
  }
);

// DELETE /api/registrations/:id
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { user } = req;

    if (!user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    try {
      const reg = await prisma.registration.findUnique({
        where: { id },
        include: { examSchedule: true },
      });

      if (!reg) {
        res.status(404).json({ error: 'Registration not found.' });
        return;
      }

      if (user.role === 'STUDENT' && reg.studentId !== user.studentId) {
        res.status(403).json({ error: 'Unauthorized to cancel this registration.' });
        return;
      }

      if (reg.examSchedule.resultsPublished) {
        res.status(400).json({ error: 'Cannot cancel registration: results have already been published.' });
        return;
      }

      await prisma.registration.delete({ where: { id } });

      res.json({ message: 'Registration cancelled successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to cancel registration.' });
    }
  }
);

// GET /api/registrations/exam/:examId
router.get(
  '/exam/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN', 'HOD', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
        include: { course: true },
      });

      if (!exam) {
        res.status(404).json({ error: 'Examination not found.' });
        return;
      }

      if (user?.role === 'FACULTY' && exam.course.assignedFacultyId !== user.facultyId) {
        res.status(403).json({ error: 'Unauthorized: You are not assigned to this course.' });
        return;
      }

      const registrations = await prisma.registration.findMany({
        where: { examId },
        include: {
          student: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { student: { rollNumber: 'asc' } },
      });

      res.json({ registrations });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch exam registrations.' });
    }
  }
);

export default router;
