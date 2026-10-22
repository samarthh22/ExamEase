import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateStatistics } from '../utils/statistics.js';

const router = Router();

// GET /api/marks/exam/:examId
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
        res.status(403).json({ error: 'Unauthorized: You are not assigned to teach this course.' });
        return;
      }

      const registrations = await prisma.registration.findMany({
        where: { examId, status: 'REGISTERED' },
        include: {
          student: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
        orderBy: { student: { rollNumber: 'asc' } },
      });

      const marks = await prisma.mark.findMany({
        where: { examId },
      });

      const markMap = new Map<string, (typeof marks)[0]>();
      marks.forEach(m => markMap.set(m.studentId, m));

      const results = await prisma.result.findMany({
        where: { examId },
      });
      const resultMap = new Map<string, (typeof results)[0]>();
      results.forEach(r => resultMap.set(r.studentId, r));

      const studentMarks = registrations.map(reg => {
        const mark = markMap.get(reg.studentId);
        const result = resultMap.get(reg.studentId);
        return {
          studentId: reg.student.id,
          rollNumber: reg.student.rollNumber,
          fullName: reg.student.user.fullName,
          email: reg.student.user.email,
          markId: mark?.id || null,
          marksObtained: mark !== undefined ? mark.marksObtained : null,
          remarks: mark?.remarks || '',
          resultGrade: result?.computedGrade || null,
          resultStatus: result?.status || null,
        };
      });

      const markValues = studentMarks
        .map(sm => sm.marksObtained)
        .filter((m): m is number => m !== null);

      const statistics = calculateStatistics(markValues);
      const hasStaleResults = results.some(r => r.status === 'NEEDS_RECALCULATION');

      res.json({
        exam: {
          id: exam.id,
          courseCode: exam.course.courseCode,
          courseTitle: exam.course.title,
          examType: exam.examType,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          venue: exam.venue,
          maxMarks: exam.maxMarks,
          resultsPublished: exam.resultsPublished,
          status: exam.status,
        },
        studentMarks,
        statistics,
        hasStaleResults,
      });
    } catch (err: any) {
      console.error('Fetch marks error:', err);
      res.status(500).json({ error: 'Failed to fetch student marks.' });
    }
  }
);

// POST /api/marks/exam/:examId
router.post(
  '/exam/:examId',
  authenticateToken,
  requireRoles(['FACULTY', 'EXAM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const examId = String(req.params.examId);
    const { user } = req;
    const { marks } = req.body;

    if (!Array.isArray(marks) || marks.length === 0) {
      res.status(400).json({ error: 'Payload must contain a non-empty array of marks.' });
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
        res.status(403).json({
          error: 'Access denied: You are not assigned as faculty for this course and cannot enter marks.',
        });
        return;
      }

      const errors: string[] = [];
      const sanitizedEntries: { studentId: string; marksObtained: number; remarks?: string }[] = [];

      for (let i = 0; i < marks.length; i++) {
        const item = marks[i];
        if (!item.studentId) {
          errors.push(`Row ${i + 1}: Missing studentId.`);
          continue;
        }

        const markNum = parseFloat(item.marksObtained);
        if (isNaN(markNum)) {
          errors.push(`Row ${i + 1} (Student ${item.studentId}): Mark must be a valid number.`);
          continue;
        }

        if (markNum < 0) {
          errors.push(`Row ${i + 1}: Mark cannot be negative (${markNum}). Minimum allowed is 0.`);
          continue;
        }

        if (markNum > exam.maxMarks) {
          errors.push(
            `Row ${i + 1}: Mark (${markNum}) exceeds the maximum allowed marks (${exam.maxMarks}) for this examination.`
          );
          continue;
        }

        sanitizedEntries.push({
          studentId: String(item.studentId),
          marksObtained: markNum,
          remarks: item.remarks ? String(item.remarks).trim() : undefined,
        });
      }

      if (errors.length > 0) {
        res.status(400).json({
          error: 'Mark validation failed.',
          details: errors,
        });
        return;
      }

      const studentIds = sanitizedEntries.map(e => e.studentId);
      const registered = await prisma.registration.findMany({
        where: {
          examId,
          studentId: { in: studentIds },
          status: 'REGISTERED',
        },
      });

      const registeredSet = new Set(registered.map(r => r.studentId));
      for (const entry of sanitizedEntries) {
        if (!registeredSet.has(entry.studentId)) {
          res.status(400).json({
            error: `Student ${entry.studentId} is not actively registered for this examination.`,
          });
          return;
        }
      }

      await prisma.$transaction(async tx => {
        for (const entry of sanitizedEntries) {
          await tx.mark.upsert({
            where: {
              studentId_examId: {
                studentId: entry.studentId,
                examId,
              },
            },
            create: {
              studentId: entry.studentId,
              examId,
              marksObtained: entry.marksObtained,
              remarks: entry.remarks,
            },
            update: {
              marksObtained: entry.marksObtained,
              remarks: entry.remarks,
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

      const allSavedMarks = await prisma.mark.findMany({
        where: { examId },
        select: { marksObtained: true },
      });
      const markValues = allSavedMarks.map(m => m.marksObtained);
      const statistics = calculateStatistics(markValues);

      res.json({
        message: `Successfully saved ${sanitizedEntries.length} student marks. Dependent results marked for recalculation.`,
        statistics,
        needsRecalculation: true,
      });
    } catch (err: any) {
      console.error('Save marks error:', err);
      res.status(500).json({ error: 'Failed to save marks.' });
    }
  }
);

export default router;
