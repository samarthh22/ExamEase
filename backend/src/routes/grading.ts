import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { validateGradingBoundaries, determineGrade, BoundaryInput } from '../utils/gradeValidator.js';
import { calculateStatistics } from '../utils/statistics.js';

const router = Router();

// GET /api/grading/boundaries/:examId
router.get(
  '/boundaries/:examId',
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
          gradingBoundaries: {
            orderBy: { lowerBound: 'asc' },
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

      const marks = await prisma.mark.findMany({
        where: { examId },
        select: { marksObtained: true },
      });
      const markValues = marks.map(m => m.marksObtained);
      const statistics = calculateStatistics(markValues);

      const results = await prisma.result.findMany({
        where: { examId },
      });

      const totalRegistered = await prisma.registration.count({
        where: { examId, status: 'REGISTERED' },
      });

      const hasStaleResults = results.some(r => r.status === 'NEEDS_RECALCULATION');

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
        boundaries: exam.gradingBoundaries,
        statistics,
        totalRegistered,
        marksEnteredCount: marks.length,
        resultsGeneratedCount: results.length,
        hasStaleResults,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch grading boundaries.' });
    }
  }
);

// POST /api/grading/boundaries/:examId
router.post(
  '/boundaries/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;
    const { boundaries } = req.body as { boundaries: BoundaryInput[] };

    if (!Array.isArray(boundaries) || boundaries.length === 0) {
      res.status(400).json({ error: 'At least one grading boundary is required.' });
      return;
    }

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
        include: { course: true },
      });

      if (!exam) {
        res.status(404).json({ error: 'Examination schedule not found.' });
        return;
      }

      if (user?.role === 'FACULTY' && exam.course.assignedFacultyId !== user.facultyId) {
        res.status(403).json({ error: 'Unauthorized: You are not assigned to this course.' });
        return;
      }

      const sanitized: BoundaryInput[] = boundaries.map(b => ({
        gradeLabel: String(b.gradeLabel).trim().toUpperCase(),
        lowerBound: parseFloat(b.lowerBound as any),
        upperBound: parseFloat(b.upperBound as any),
      }));

      const validation = validateGradingBoundaries(sanitized, exam.maxMarks);
      if (!validation.isValid) {
        res.status(400).json({
          error: 'Grading boundary validation failed.',
          details: validation.errors,
        });
        return;
      }

      await prisma.$transaction(async tx => {
        await tx.gradingBoundary.deleteMany({
          where: { examId },
        });

        for (const b of sanitized) {
          await tx.gradingBoundary.create({
            data: {
              examId,
              gradeLabel: b.gradeLabel,
              lowerBound: b.lowerBound,
              upperBound: b.upperBound,
            },
          });
        }

        const existingResults = await tx.result.findMany({
          where: { examId },
        });

        if (existingResults.length > 0) {
          await tx.result.updateMany({
            where: { examId },
            data: { status: 'NEEDS_RECALCULATION' },
          });

          if (exam.resultsPublished) {
            await tx.examSchedule.update({
              where: { id: examId },
              data: { resultsPublished: false },
            });
          }
        }
      });

      const updatedBoundaries = await prisma.gradingBoundary.findMany({
        where: { examId },
        orderBy: { lowerBound: 'asc' },
      });

      res.json({
        message: 'Grading boundaries saved successfully. Generated results (if any) marked for recalculation.',
        boundaries: updatedBoundaries,
      });
    } catch (err: any) {
      console.error('Save boundaries error:', err);
      res.status(500).json({ error: 'Failed to save grading boundaries.' });
    }
  }
);

// POST /api/grading/generate/:examId
router.post(
  '/generate/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
        include: {
          course: true,
          gradingBoundaries: {
            orderBy: { lowerBound: 'asc' },
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

      if (exam.gradingBoundaries.length === 0) {
        res.status(400).json({
          error: 'No grading boundaries defined. Please define valid grading boundaries before generating grades.',
        });
        return;
      }

      const boundaryValidation = validateGradingBoundaries(
        exam.gradingBoundaries.map(b => ({
          gradeLabel: b.gradeLabel,
          lowerBound: b.lowerBound,
          upperBound: b.upperBound,
        })),
        exam.maxMarks
      );

      if (!boundaryValidation.isValid) {
        res.status(400).json({
          error: 'Grading boundaries are invalid or incomplete.',
          details: boundaryValidation.errors,
        });
        return;
      }

      const registrations = await prisma.registration.findMany({
        where: { examId, status: 'REGISTERED' },
        include: {
          student: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
      });

      if (registrations.length === 0) {
        res.status(400).json({
          error: 'No students are registered for this examination.',
        });
        return;
      }

      const marks = await prisma.mark.findMany({
        where: { examId },
      });
      const markMap = new Map<string, number>();
      marks.forEach(m => markMap.set(m.studentId, m.marksObtained));

      const missingMarksStudents: { studentId: string; rollNumber: string; fullName: string }[] = [];
      const eligibleToGrade: { studentId: string; marksObtained: number }[] = [];

      for (const reg of registrations) {
        const markVal = markMap.get(reg.studentId);
        if (markVal === undefined || markVal === null) {
          missingMarksStudents.push({
            studentId: reg.studentId,
            rollNumber: reg.student.rollNumber,
            fullName: reg.student.user.fullName,
          });
        } else {
          eligibleToGrade.push({
            studentId: reg.studentId,
            marksObtained: markVal,
          });
        }
      }

      if (missingMarksStudents.length > 0) {
        res.status(400).json({
          error: `Cannot generate grades: ${missingMarksStudents.length} registered student(s) do not have marks entered. Flag missing marks before generation.`,
          missingStudents: missingMarksStudents,
        });
        return;
      }

      const generatedResults: any[] = [];

      await prisma.$transaction(async tx => {
        for (const item of eligibleToGrade) {
          const computedGrade = determineGrade(
            item.marksObtained,
            exam.gradingBoundaries,
            exam.maxMarks
          );

          if (!computedGrade) {
            throw new Error(
              `Failed to map mark ${item.marksObtained} to a grade for student ${item.studentId}. Check boundary coverage.`
            );
          }

          const resRecord = await tx.result.upsert({
            where: {
              studentId_examId: {
                studentId: item.studentId,
                examId,
              },
            },
            create: {
              studentId: item.studentId,
              examId,
              marksObtained: item.marksObtained,
              computedGrade,
              status: 'UNPUBLISHED',
            },
            update: {
              marksObtained: item.marksObtained,
              computedGrade,
              status: 'UNPUBLISHED',
              updatedAt: new Date(),
            },
          });

          generatedResults.push(resRecord);
        }

        await tx.examSchedule.update({
          where: { id: examId },
          data: { resultsPublished: false },
        });
      });

      res.json({
        message: `Successfully generated grades for ${generatedResults.length} student(s). Results are currently UNPUBLISHED.`,
        generatedCount: generatedResults.length,
        status: 'UNPUBLISHED',
      });
    } catch (err: any) {
      console.error('Generate grades error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate grades.' });
    }
  }
);

// POST /api/grading/publish/:examId
router.post(
  '/publish/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
        include: { course: true },
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
      });

      if (results.length === 0) {
        res.status(400).json({
          error: 'No results have been generated for this examination yet. Generate grades first before publishing.',
        });
        return;
      }

      const staleResults = results.filter(r => r.status === 'NEEDS_RECALCULATION');
      if (staleResults.length > 0) {
        res.status(400).json({
          error: `Cannot publish: ${staleResults.length} result(s) are stale due to modified marks or boundaries. Please recalculate (regenerate) grades first.`,
        });
        return;
      }

      await prisma.$transaction(async tx => {
        await tx.examSchedule.update({
          where: { id: examId },
          data: { resultsPublished: true },
        });

        await tx.result.updateMany({
          where: { examId },
          data: { status: 'PUBLISHED' },
        });
      });

      res.json({
        message: `Results for ${exam.course.courseCode} (${exam.course.title}) have been explicitly published. Students can now view their grades.`,
        publishedCount: results.length,
        status: 'PUBLISHED',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to publish results.' });
    }
  }
);

// POST /api/grading/unpublish/:examId
router.post(
  '/unpublish/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;

    try {
      const exam = await prisma.examSchedule.findUnique({
        where: { id: examId },
        include: { course: true },
      });

      if (!exam) {
        res.status(404).json({ error: 'Examination schedule not found.' });
        return;
      }

      if (user?.role === 'FACULTY' && exam.course.assignedFacultyId !== user.facultyId) {
        res.status(403).json({ error: 'Unauthorized: You are not assigned to this course.' });
        return;
      }

      await prisma.$transaction(async tx => {
        await tx.examSchedule.update({
          where: { id: examId },
          data: { resultsPublished: false },
        });

        await tx.result.updateMany({
          where: { examId },
          data: { status: 'UNPUBLISHED' },
        });
      });

      res.json({
        message: `Results unpublished for ${exam.course.courseCode}. Students cannot view them until republished.`,
        status: 'UNPUBLISHED',
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to unpublish results.' });
    }
  }
);

export default router;
