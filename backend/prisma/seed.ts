import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ExamEase database...');

  // Clean existing records in correct order to respect foreign keys
  await prisma.result.deleteMany();
  await prisma.gradingBoundary.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.facultyMember.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const hashedFacultyPassword = await bcrypt.hash('Faculty@123', 10);
  const hashedHodPassword = await bcrypt.hash('Hod@123', 10);
  const hashedStudentPassword = await bcrypt.hash('Student@123', 10);

  // 1. System Administrator
  const sysAdminUser = await prisma.user.create({
    data: {
      email: 'sysadmin@examease.edu',
      passwordHash: hashedAdminPassword,
      fullName: 'System Administrator',
      role: 'SYSTEM_ADMIN',
      active: true,
    },
  });

  // 2. Examination Administrator
  const examAdminUser = await prisma.user.create({
    data: {
      email: 'examadmin@examease.edu',
      passwordHash: hashedAdminPassword,
      fullName: 'Chief Exam Controller',
      role: 'EXAM_ADMIN',
      active: true,
    },
  });

  // 3. Department Coordinator / HOD
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod.cs@examease.edu',
      passwordHash: hashedHodPassword,
      fullName: 'Prof. Vikram Malhotra',
      role: 'HOD',
      active: true,
    },
  });

  // 4. Faculty Members
  const facultyUser1 = await prisma.user.create({
    data: {
      email: 'prof.sharma@examease.edu',
      passwordHash: hashedFacultyPassword,
      fullName: 'Dr. Rajesh Sharma',
      role: 'FACULTY',
      active: true,
      facultyProfile: {
        create: {
          department: 'Computer Science & Engineering',
          designation: 'Associate Professor',
        },
      },
    },
    include: { facultyProfile: true },
  });

  const facultyUser2 = await prisma.user.create({
    data: {
      email: 'prof.anita@examease.edu',
      passwordHash: hashedFacultyPassword,
      fullName: 'Dr. Anita Rao',
      role: 'FACULTY',
      active: true,
      facultyProfile: {
        create: {
          department: 'Computer Science & Engineering',
          designation: 'Assistant Professor',
        },
      },
    },
    include: { facultyProfile: true },
  });

  // 5. Students
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'rahul.verma@student.examease.edu',
      passwordHash: hashedStudentPassword,
      fullName: 'Rahul Verma',
      role: 'STUDENT',
      active: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023001',
          department: 'Computer Science & Engineering',
          batchYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'priya.patel@student.examease.edu',
      passwordHash: hashedStudentPassword,
      fullName: 'Priya Patel',
      role: 'STUDENT',
      active: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023002',
          department: 'Computer Science & Engineering',
          batchYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'amit.kumar@student.examease.edu',
      passwordHash: hashedStudentPassword,
      fullName: 'Amit Kumar',
      role: 'STUDENT',
      active: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023003',
          department: 'Computer Science & Engineering',
          batchYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser4 = await prisma.user.create({
    data: {
      email: 'sneha.reddy@student.examease.edu',
      passwordHash: hashedStudentPassword,
      fullName: 'Sneha Reddy',
      role: 'STUDENT',
      active: true,
      studentProfile: {
        create: {
          rollNumber: 'CS2023004',
          department: 'Computer Science & Engineering',
          batchYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  console.log('Created Users & Profiles.');

  // 6. Courses
  const courseCS101 = await prisma.course.create({
    data: {
      courseCode: 'CS101',
      title: 'Data Structures & Algorithms',
      credits: 4,
      department: 'Computer Science & Engineering',
      assignedFacultyId: facultyUser1.facultyProfile!.id,
    },
  });

  const courseCS102 = await prisma.course.create({
    data: {
      courseCode: 'CS102',
      title: 'Database Management Systems',
      credits: 3,
      department: 'Computer Science & Engineering',
      assignedFacultyId: facultyUser1.facultyProfile!.id,
    },
  });

  const courseCS103 = await prisma.course.create({
    data: {
      courseCode: 'CS103',
      title: 'Computer Networks',
      credits: 3,
      department: 'Computer Science & Engineering',
      assignedFacultyId: facultyUser2.facultyProfile!.id,
    },
  });

  const courseCS104 = await prisma.course.create({
    data: {
      courseCode: 'CS104',
      title: 'Software Engineering Principles',
      credits: 3,
      department: 'Computer Science & Engineering',
      assignedFacultyId: facultyUser2.facultyProfile!.id,
    },
  });

  console.log('Created Courses.');

  // 7. Enrollments
  const s1Id = studentUser1.studentProfile!.id;
  const s2Id = studentUser2.studentProfile!.id;
  const s3Id = studentUser3.studentProfile!.id;
  const s4Id = studentUser4.studentProfile!.id;

  // Student 1: CS101, CS102, CS103
  await prisma.enrollment.createMany({
    data: [
      { studentId: s1Id, courseId: courseCS101.id },
      { studentId: s1Id, courseId: courseCS102.id },
      { studentId: s1Id, courseId: courseCS103.id },
    ],
  });

  // Student 2: CS101, CS102, CS104
  await prisma.enrollment.createMany({
    data: [
      { studentId: s2Id, courseId: courseCS101.id },
      { studentId: s2Id, courseId: courseCS102.id },
      { studentId: s2Id, courseId: courseCS104.id },
    ],
  });

  // Student 3: CS101, CS103
  await prisma.enrollment.createMany({
    data: [
      { studentId: s3Id, courseId: courseCS101.id },
      { studentId: s3Id, courseId: courseCS103.id },
    ],
  });

  // Student 4: CS102, CS104
  await prisma.enrollment.createMany({
    data: [
      { studentId: s4Id, courseId: courseCS102.id },
      { studentId: s4Id, courseId: courseCS104.id },
    ],
  });

  console.log('Enrolled students in courses.');

  // 8. Exam Schedules
  // Exam 1: CS101 Final Exam (Completed, with Marks, Boundaries, and PUBLISHED Results)
  const exam1 = await prisma.examSchedule.create({
    data: {
      courseId: courseCS101.id,
      examType: 'FINAL',
      date: '2026-11-15',
      startTime: '09:00',
      endTime: '12:00',
      venue: 'Auditorium Main Hall',
      maxMarks: 100.0,
      status: 'PUBLISHED',
      resultsPublished: true,
    },
  });

  // Exam 2: CS102 Midterm Exam (Marks entered, Boundaries defined, UNPUBLISHED Results - for Demo Flow C)
  const exam2 = await prisma.examSchedule.create({
    data: {
      courseId: courseCS102.id,
      examType: 'MIDTERM',
      date: '2026-11-20',
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Lab Room 301',
      maxMarks: 50.0,
      status: 'PUBLISHED',
      resultsPublished: false,
    },
  });

  // Exam 3: CS103 Final Exam (Open for Registration - Demo Flow A: Student Register)
  const exam3 = await prisma.examSchedule.create({
    data: {
      courseId: courseCS103.id,
      examType: 'FINAL',
      date: '2026-11-25',
      startTime: '14:00',
      endTime: '17:00',
      venue: 'Auditorium Main Hall',
      maxMarks: 100.0,
      status: 'PUBLISHED',
      resultsPublished: false,
    },
  });

  // Exam 4: Non-conflicting afternoon exam at same venue (Demo venue conflict verification)
  const exam4 = await prisma.examSchedule.create({
    data: {
      courseId: courseCS104.id,
      examType: 'MIDTERM',
      date: '2026-11-15',
      startTime: '14:00',
      endTime: '16:00',
      venue: 'Auditorium Main Hall',
      maxMarks: 50.0,
      status: 'PUBLISHED',
      resultsPublished: false,
    },
  });

  console.log('Created Exam Schedules.');

  // 9. Registrations
  // Exam 1: s1, s2, s3
  await prisma.registration.createMany({
    data: [
      { studentId: s1Id, examId: exam1.id, status: 'REGISTERED' },
      { studentId: s2Id, examId: exam1.id, status: 'REGISTERED' },
      { studentId: s3Id, examId: exam1.id, status: 'REGISTERED' },
    ],
  });

  // Exam 2: s1, s2
  await prisma.registration.createMany({
    data: [
      { studentId: s1Id, examId: exam2.id, status: 'REGISTERED' },
      { studentId: s2Id, examId: exam2.id, status: 'REGISTERED' },
    ],
  });

  // Exam 3: Not registered yet! Ready for student to register in viva.

  console.log('Created Registrations.');

  // 10. Marks
  // Exam 1 Marks
  await prisma.mark.createMany({
    data: [
      { studentId: s1Id, examId: exam1.id, marksObtained: 88.5, remarks: 'Excellent theoretical mastery' },
      { studentId: s2Id, examId: exam1.id, marksObtained: 94.0, remarks: 'Outstanding algorithmic design' },
      { studentId: s3Id, examId: exam1.id, marksObtained: 72.5, remarks: 'Good implementation and diagrams' },
    ],
  });

  // Exam 2 Marks (max 50)
  await prisma.mark.createMany({
    data: [
      { studentId: s1Id, examId: exam2.id, marksObtained: 44.0, remarks: 'Good query optimization' },
      { studentId: s2Id, examId: exam2.id, marksObtained: 47.5, remarks: 'Flawless normalization proof' },
    ],
  });

  console.log('Entered Marks.');

  // 11. Grading Boundaries
  // Exam 1: Max 100
  await prisma.gradingBoundary.createMany({
    data: [
      { examId: exam1.id, gradeLabel: 'F', lowerBound: 0, upperBound: 40 },
      { examId: exam1.id, gradeLabel: 'D', lowerBound: 40, upperBound: 55 },
      { examId: exam1.id, gradeLabel: 'C', lowerBound: 55, upperBound: 70 },
      { examId: exam1.id, gradeLabel: 'B', lowerBound: 70, upperBound: 85 },
      { examId: exam1.id, gradeLabel: 'A', lowerBound: 85, upperBound: 100 },
    ],
  });

  // Exam 2: Max 50
  await prisma.gradingBoundary.createMany({
    data: [
      { examId: exam2.id, gradeLabel: 'F', lowerBound: 0, upperBound: 20 },
      { examId: exam2.id, gradeLabel: 'C', lowerBound: 20, upperBound: 30 },
      { examId: exam2.id, gradeLabel: 'B', lowerBound: 30, upperBound: 40 },
      { examId: exam2.id, gradeLabel: 'A', lowerBound: 40, upperBound: 50 },
    ],
  });

  console.log('Configured Grading Boundaries.');

  // 12. Results
  // Exam 1: PUBLISHED results
  await prisma.result.createMany({
    data: [
      {
        studentId: s1Id,
        examId: exam1.id,
        marksObtained: 88.5,
        computedGrade: 'A',
        status: 'PUBLISHED',
      },
      {
        studentId: s2Id,
        examId: exam1.id,
        marksObtained: 94.0,
        computedGrade: 'A',
        status: 'PUBLISHED',
      },
      {
        studentId: s3Id,
        examId: exam1.id,
        marksObtained: 72.5,
        computedGrade: 'B',
        status: 'PUBLISHED',
      },
    ],
  });

  // Exam 2: UNPUBLISHED results (generated but not yet published)
  await prisma.result.createMany({
    data: [
      {
        studentId: s1Id,
        examId: exam2.id,
        marksObtained: 44.0,
        computedGrade: 'A',
        status: 'UNPUBLISHED',
      },
      {
        studentId: s2Id,
        examId: exam2.id,
        marksObtained: 47.5,
        computedGrade: 'A',
        status: 'UNPUBLISHED',
      },
    ],
  });

  console.log('Generated Results (both Published and Unpublished).');
  console.log('Database seeding successfully finished!');
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
