import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/results/my-results
router.get(
  '/my-results',
  authenticateToken,
  requireRoles(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = req.user?.studentId;

    if (!studentId) {
      res.status(403).json({ error: 'Student profile not associated with this account.' });
      return;
    }

    try {
      const results = await prisma.result.findMany({
        where: {
          studentId,
          status: 'PUBLISHED',
          examSchedule: {
            resultsPublished: true,
          },
        },
        include: {
          examSchedule: {
            include: {
              course: {
                select: {
                  courseCode: true,
                  title: true,
                  credits: true,
                  department: true,
                },
              },
            },
          },
        },
        orderBy: {
          examSchedule: {
            date: 'desc',
          },
        },
      });

      const formatted = results.map(r => ({
        resultId: r.id,
        examId: r.examId,
        courseCode: r.examSchedule.course.courseCode,
        courseTitle: r.examSchedule.course.title,
        credits: r.examSchedule.course.credits,
        examType: r.examSchedule.examType,
        examDate: r.examSchedule.date,
        maxMarks: r.examSchedule.maxMarks,
        marksObtained: r.marksObtained,
        computedGrade: r.computedGrade,
        percentage: ((r.marksObtained / r.examSchedule.maxMarks) * 100).toFixed(1),
        publishedAt: r.updatedAt,
      }));

      res.json({ results: formatted });
    } catch (err: any) {
      console.error('Fetch student results error:', err);
      res.status(500).json({ error: 'Failed to fetch results.' });
    }
  }
);

// GET /api/results/exam/:examId
router.get(
  '/exam/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN', 'HOD']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
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

      if (!exam) {
        res.status(404).json({ error: 'Examination schedule not found.' });
        return;
      }

      if (user?.role === 'FACULTY' && exam.course.assignedFacultyId !== user.facultyId) {
        res.status(403).json({ error: 'Unauthorized: You are not assigned to this course.' });
        return;
      }

      const results = await prisma.result.findMany({
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

      const gradeCounts: Record<string, number> = {};
      results.forEach(r => {
        gradeCounts[r.computedGrade] = (gradeCounts[r.computedGrade] || 0) + 1;
      });

      res.json({
        exam: {
          id: exam.id,
          courseCode: exam.course.courseCode,
          courseTitle: exam.course.title,
          examType: exam.examType,
          maxMarks: exam.maxMarks,
          resultsPublished: exam.resultsPublished,
          status: exam.status,
        },
        results: results.map(r => ({
          resultId: r.id,
          studentId: r.studentId,
          rollNumber: r.student.rollNumber,
          fullName: r.student.user.fullName,
          marksObtained: r.marksObtained,
          computedGrade: r.computedGrade,
          status: r.status,
          updatedAt: r.updatedAt,
        })),
        gradeDistribution: gradeCounts,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch exam results.' });
    }
  }
);

export default router;
