import { prisma } from '../db.js';

export interface ConflictCheckParams {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  venue: string;
  excludeExamId?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  message?: string;
  conflictingExam?: {
    id: string;
    courseCode: string;
    courseTitle: string;
    examType: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
  };
}

// Convert "HH:mm" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return -1;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return -1;
  return h * 60 + m;
}

export async function checkVenueConflict(
  params: ConflictCheckParams
): Promise<ConflictCheckResult> {
  const { date, startTime, endTime, venue, excludeExamId } = params;

  const newStartMin = timeToMinutes(startTime);
  const newEndMin = timeToMinutes(endTime);

  if (newStartMin < 0 || newEndMin < 0) {
    return {
      hasConflict: true,
      message: 'Invalid time format. Please provide valid HH:mm (24-hour) times.',
    };
  }

  if (newStartMin >= newEndMin) {
    return {
      hasConflict: true,
      message: 'Examination start time must precede end time.',
    };
  }

  // Find all non-cancelled exams on the same date and same venue
  const existingExams = await prisma.examSchedule.findMany({
    where: {
      date: date.trim(),
      venue: {
        equals: venue.trim(),
      },
      status: {
        not: 'CANCELLED',
      },
      ...(excludeExamId ? { id: { not: excludeExamId } } : {}),
    },
    include: {
      course: true,
    },
  });

  for (const exam of existingExams) {
    const existingStartMin = timeToMinutes(exam.startTime);
    const existingEndMin = timeToMinutes(exam.endTime);

    if (existingStartMin < 0 || existingEndMin < 0) continue;

    // Overlap condition: startA < endB && endA > startB
    if (newStartMin < existingEndMin && newEndMin > existingStartMin) {
      return {
        hasConflict: true,
        message: `Venue conflict detected: ${venue} is already booked on ${date} from ${exam.startTime} to ${exam.endTime} for ${exam.course.courseCode} (${exam.course.title}).`,
        conflictingExam: {
          id: exam.id,
          courseCode: exam.course.courseCode,
          courseTitle: exam.course.title,
          examType: exam.examType,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          venue: exam.venue,
        },
      };
    }
  }

  return { hasConflict: false };
}
