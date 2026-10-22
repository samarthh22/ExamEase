import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { calculateStatistics } from '../utils/statistics.js';

const router = Router();

// GET /api/reports/dashboard-stats
router.get(
  '/dashboard-stats',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { user } = req;
    if (!user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    try {
      const studentCount = await prisma.student.count();
      const facultyCount = await prisma.facultyMember.count();
      const courseCount = await prisma.course.count();
      const examCount = await prisma.examSchedule.count({
        where: { status: { not: 'CANCELLED' } },
      });
      const registrationCount = await prisma.registration.count({
        where: { status: 'REGISTERED' },
      });

      const publishedResults = await prisma.result.findMany({
        where: { status: 'PUBLISHED' },
      });
      const totalPublished = publishedResults.length;
      const passedCount = publishedResults.filter(r => r.computedGrade !== 'F').length;
      const passRate = totalPublished > 0 ? ((passedCount / totalPublished) * 100).toFixed(1) : '100.0';

      let roleSpecific: any = {};
      if (user.role === 'STUDENT' && user.studentId) {
        const myEnrolledCourses = await prisma.enrollment.count({
          where: { studentId: user.studentId },
        });
        const myRegistrations = await prisma.registration.count({
          where: { studentId: user.studentId, status: 'REGISTERED' },
        });
        const myPublishedResults = await prisma.result.count({
          where: {
            studentId: user.studentId,
            status: 'PUBLISHED',
            examSchedule: { resultsPublished: true },
          },
        });
        roleSpecific = {
          enrolledCourses: myEnrolledCourses,
          registrations: myRegistrations,
          publishedResults: myPublishedResults,
        };
      } else if (user.role === 'FACULTY' && user.facultyId) {
        const myCourses = await prisma.course.count({
          where: { assignedFacultyId: user.facultyId },
        });
        const myExams = await prisma.examSchedule.count({
          where: { course: { assignedFacultyId: user.facultyId } },
        });
        roleSpecific = {
          assignedCourses: myCourses,
          assignedExams: myExams,
        };
      }

      res.json({
        systemStats: {
          students: studentCount,
          faculty: facultyCount,
          courses: courseCount,
          exams: examCount,
          registrations: registrationCount,
          passRate: `${passRate}%`,
        },
        roleSpecific,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
  }
);

// GET /api/reports/course-performance
router.get(
  '/course-performance',
  authenticateToken,
  requireRoles(['EXAM_ADMIN', 'HOD', 'FACULTY']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const courses = await prisma.course.findMany({
        include: {
          assignedFaculty: {
            include: { user: { select: { fullName: true } } },
          },
          examSchedules: {
            where: { status: { not: 'CANCELLED' } },
            include: {
              marks: true,
              results: true,
              _count: {
                select: { registrations: true },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { courseCode: 'asc' },
      });

      const report = courses.map(course => {
        let totalMarks: number[] = [];
        let totalResults: { computedGrade: string; status: string }[] = [];

        course.examSchedules.forEach(exam => {
          exam.marks.forEach(m => totalMarks.push(m.marksObtained));
          exam.results.forEach(r => totalResults.push(r));
        });

        const stats = calculateStatistics(totalMarks);
        const passedCount = totalResults.filter(r => r.computedGrade !== 'F').length;
        const failedCount = totalResults.filter(r => r.computedGrade === 'F').length;
        const passRate =
          totalResults.length > 0 ? ((passedCount / totalResults.length) * 100).toFixed(1) : 'N/A';

        return {
          courseId: course.id,
          courseCode: course.courseCode,
          courseTitle: course.title,
          department: course.department,
          facultyName: course.assignedFaculty?.user.fullName || 'Unassigned',
          totalEnrolled: course._count.enrollments,
          examCount: course.examSchedules.length,
          stats,
          passedCount,
          failedCount,
          passRate: passRate === 'N/A' ? 'N/A' : `${passRate}%`,
        };
      });

      res.json({ coursePerformance: report });
    } catch (err: any) {
      console.error('Course performance report error:', err);
      res.status(500).json({ error: 'Failed to generate course performance report.' });
    }
  }
);

// GET /api/reports/student-transcript/:studentId
router.get(
  '/student-transcript/:studentId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = String(req.params.studentId);
    const { user } = req;

    if (!user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    if (user.role === 'STUDENT' && user.studentId !== studentId) {
      res.status(403).json({ error: 'Forbidden: You cannot view another student transcript.' });
      return;
    }

    try {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: { select: { fullName: true, email: true } },
          enrollments: {
            include: {
              course: true,
            },
          },
          results: {
            where: {
              status: 'PUBLISHED',
              examSchedule: { resultsPublished: true },
            },
            include: {
              examSchedule: {
                include: { course: true },
              },
            },
          },
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      res.json({
        student: {
          id: student.id,
          rollNumber: student.rollNumber,
          fullName: student.user.fullName,
          email: student.user.email,
          department: student.department,
          batchYear: student.batchYear,
        },
        enrolledCourses: student.enrollments.map(e => ({
          courseCode: e.course.courseCode,
          title: e.course.title,
          credits: e.course.credits,
        })),
        publishedResults: student.results.map(r => ({
          courseCode: r.examSchedule.course.courseCode,
          courseTitle: r.examSchedule.course.title,
          credits: r.examSchedule.course.credits,
          examType: r.examSchedule.examType,
          date: r.examSchedule.date,
          marksObtained: r.marksObtained,
          maxMarks: r.examSchedule.maxMarks,
          computedGrade: r.computedGrade,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate student transcript.' });
    }
  }
);

export default router;
