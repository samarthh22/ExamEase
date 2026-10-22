export type UserRole = 'STUDENT' | 'FACULTY' | 'EXAM_ADMIN' | 'HOD' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  active?: boolean;
  studentId?: string;
  rollNumber?: string;
  department?: string;
  facultyId?: string;
  designation?: string;
}

export interface Course {
  id: string;
  courseCode: string;
  title: string;
  credits: number;
  department: string;
  assignedFacultyId: string | null;
  assignedFaculty?: {
    user: { fullName: string; email?: string };
  };
  _count?: {
    enrollments: number;
    examSchedules: number;
  };
}

export interface ExamSchedule {
  id: string;
  courseId: string;
  examType: 'MIDTERM' | 'FINAL' | 'SUPPLEMENTARY';
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxMarks: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  resultsPublished: boolean;
  course: Course;
  _count?: {
    registrations: number;
    marks: number;
    results: number;
  };
}

export interface ClassStatistics {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface GradingBoundary {
  id?: string;
  examId?: string;
  gradeLabel: string;
  lowerBound: number;
  upperBound: number;
}

export interface StudentMarkEntry {
  studentId: string;
  rollNumber: string;
  fullName: string;
  email: string;
  markId: string | null;
  marksObtained: number | null;
  remarks: string;
  resultGrade: string | null;
  resultStatus: string | null;
}

export interface StudentResult {
  resultId: string;
  examId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  examType: string;
  examDate: string;
  maxMarks: number;
  marksObtained: number;
  computedGrade: string;
  percentage: string;
  publishedAt: string;
}
