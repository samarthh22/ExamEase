import assert from 'node:assert';
import http from 'node:http';
import { app } from '../src/app.js';
import { calculateStatistics } from '../src/utils/statistics.js';
import { validateGradingBoundaries, determineGrade } from '../src/utils/gradeValidator.js';
import { checkVenueConflict, timeToMinutes } from '../src/utils/conflictChecker.js';

let server: http.Server;
const PORT = 5555;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(path: string, options: { method?: string; token?: string; body?: any } = {}) {
  const { method = 'GET', token, body } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- Starting ExamEase Automated Test Suite ---');
  server = app.listen(PORT);

  try {
    // 1. Statistics Calculation Unit Tests
    console.log('Test 1: Class statistics utility calculation');
    const emptyStats = calculateStatistics([]);
    assert.strictEqual(emptyStats.count, 0);
    assert.strictEqual(emptyStats.mean, 0);

    const stats = calculateStatistics([80, 90, 70, 60, 100]);
    assert.strictEqual(stats.count, 5);
    assert.strictEqual(stats.mean, 80);
    assert.strictEqual(stats.median, 80);
    assert.strictEqual(stats.min, 60);
    assert.strictEqual(stats.max, 100);
    assert.strictEqual(stats.stdDev, 14.14);
    console.log('✓ Class statistics unit tests passed');

    // 2. Grading Boundary Validator Unit Tests
    console.log('Test 2: Grading boundary validator');
    const validBoundaries = [
      { gradeLabel: 'F', lowerBound: 0, upperBound: 40 },
      { gradeLabel: 'C', lowerBound: 40, upperBound: 60 },
      { gradeLabel: 'B', lowerBound: 60, upperBound: 80 },
      { gradeLabel: 'A', lowerBound: 80, upperBound: 100 },
    ];
    const validRes = validateGradingBoundaries(validBoundaries, 100);
    assert.strictEqual(validRes.isValid, true);
    assert.strictEqual(determineGrade(35, validBoundaries, 100), 'F');
    assert.strictEqual(determineGrade(40, validBoundaries, 100), 'C');
    assert.strictEqual(determineGrade(79.5, validBoundaries, 100), 'B');
    assert.strictEqual(determineGrade(100, validBoundaries, 100), 'A');

    const gapBoundaries = [
      { gradeLabel: 'F', lowerBound: 0, upperBound: 40 },
      { gradeLabel: 'A', lowerBound: 50, upperBound: 100 },
    ];
    const gapRes = validateGradingBoundaries(gapBoundaries, 100);
    assert.strictEqual(gapRes.isValid, false);
    assert.match(gapRes.errors[0], /Gap detected/);

    const overlapBoundaries = [
      { gradeLabel: 'F', lowerBound: 0, upperBound: 50 },
      { gradeLabel: 'A', lowerBound: 40, upperBound: 100 },
    ];
    const overlapRes = validateGradingBoundaries(overlapBoundaries, 100);
    assert.strictEqual(overlapRes.isValid, false);
    assert.match(overlapRes.errors[0], /Overlap detected/);
    console.log('✓ Grading boundary unit tests passed');

    // 3. Venue Conflict Checker Tests
    console.log('Test 3: Venue conflict checking');
    assert.strictEqual(timeToMinutes('09:30'), 570);
    assert.strictEqual(timeToMinutes('12:00'), 720);

    const conflictResult = await checkVenueConflict({
      date: '2026-11-15',
      startTime: '10:00',
      endTime: '11:00',
      venue: 'Auditorium Main Hall',
    });
    assert.strictEqual(conflictResult.hasConflict, true);
    assert.match(conflictResult.message!, /Venue conflict detected/);

    const nonConflictResult = await checkVenueConflict({
      date: '2026-11-15',
      startTime: '12:30',
      endTime: '13:30',
      venue: 'Auditorium Main Hall',
    });
    assert.strictEqual(nonConflictResult.hasConflict, false);
    console.log('✓ Venue conflict checking tests passed');

    // 4. Authentication Endpoints
    console.log('Test 4: User authentication & JWT');
    const loginFail = await request('/auth/login', {
      method: 'POST',
      body: { email: 'sysadmin@examease.edu', password: 'WrongPassword' },
    });
    assert.strictEqual(loginFail.status, 401);

    const sysAdminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'sysadmin@examease.edu', password: 'Admin@123' },
    });
    assert.strictEqual(sysAdminLogin.status, 200);
    const adminToken = sysAdminLogin.data.token;
    assert.ok(adminToken);

    const facultyLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'prof.sharma@examease.edu', password: 'Faculty@123' },
    });
    assert.strictEqual(facultyLogin.status, 200);
    const facultyToken = facultyLogin.data.token;

    const studentLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'rahul.verma@student.examease.edu', password: 'Student@123' },
    });
    assert.strictEqual(studentLogin.status, 200);
    const studentToken = studentLogin.data.token;
    const studentId = studentLogin.data.user.studentId;

    const hodLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'hod.cs@examease.edu', password: 'Hod@123' },
    });
    assert.strictEqual(hodLogin.status, 200);
    const hodToken = hodLogin.data.token;
    console.log('✓ Authentication tests passed');

    // 5. Server-side Authorization Guards
    console.log('Test 5: Server-side authorization verification');
    const studentManageUser = await request('/users', {
      token: studentToken,
    });
    assert.strictEqual(studentManageUser.status, 403);

    const hodEnterMarks = await request('/marks/exam/fake-id', {
      method: 'POST',
      token: hodToken,
      body: { marks: [] },
    });
    assert.strictEqual(hodEnterMarks.status, 403);
    console.log('✓ Authorization guard tests passed');

    // 6. Flow A (UC-007): Student Exam Registration
    console.log('Test 6: Flow A (UC-007) - Student Exam Registration');
    const eligibleRes = await request('/registrations/eligible-exams', {
      token: studentToken,
    });
    assert.strictEqual(eligibleRes.status, 200);
    const cs103Exam = eligibleRes.data.eligibleExams.find(
      (e: any) => e.courseCode === 'CS103'
    );
    assert.ok(cs103Exam, 'CS103 exam should be eligible for enrolled student');

    const regRes = await request('/registrations', {
      method: 'POST',
      token: studentToken,
      body: { examId: cs103Exam.examId },
    });
    assert.ok(regRes.status === 200 || regRes.status === 201);

    const dupRes = await request('/registrations', {
      method: 'POST',
      token: studentToken,
      body: { examId: cs103Exam.examId },
    });
    assert.strictEqual(dupRes.status, 409);
    assert.match(dupRes.data.error, /Duplicate registration/);
    console.log('✓ Flow A (UC-007) registration tests passed');

    // 7. Flow B (UC-008): Marks Entry & Validation
    console.log('Test 7: Flow B (UC-008) - Marks Entry & Validation');
    const examListRes = await request('/exams', { token: facultyToken });
    const cs101Exam = examListRes.data.exams.find((e: any) => e.course.courseCode === 'CS101');
    assert.ok(cs101Exam);

    const negativeMarkRes = await request(`/marks/exam/${cs101Exam.id}`, {
      method: 'POST',
      token: facultyToken,
      body: {
        marks: [{ studentId, marksObtained: -10 }],
      },
    });
    assert.strictEqual(negativeMarkRes.status, 400);

    const exceedMarkRes = await request(`/marks/exam/${cs101Exam.id}`, {
      method: 'POST',
      token: facultyToken,
      body: {
        marks: [{ studentId, marksObtained: 105 }],
      },
    });
    assert.strictEqual(exceedMarkRes.status, 400);

    const validMarkRes = await request(`/marks/exam/${cs101Exam.id}`, {
      method: 'POST',
      token: facultyToken,
      body: {
        marks: [{ studentId, marksObtained: 89.0, remarks: 'Updated during testing' }],
      },
    });
    assert.strictEqual(validMarkRes.status, 200);
    assert.ok(validMarkRes.data.statistics);
    assert.strictEqual(validMarkRes.data.needsRecalculation, true);
    console.log('✓ Flow B (UC-008) marks entry tests passed');

    // 8. Flow C (UC-010): Grading Boundaries & Grade Generation
    console.log('Test 8: Flow C (UC-010) - Grade Boundaries & Generation');
    const generateRes = await request(`/grading/generate/${cs101Exam.id}`, {
      method: 'POST',
      token: facultyToken,
    });
    assert.strictEqual(generateRes.status, 200);
    assert.strictEqual(generateRes.data.status, 'UNPUBLISHED');

    const studentResultsBeforePublish = await request('/results/my-results', {
      token: studentToken,
    });
    const cs101InResults = studentResultsBeforePublish.data.results.find(
      (r: any) => r.courseCode === 'CS101'
    );
    assert.strictEqual(cs101InResults, undefined, 'Unpublished result must NOT be visible to student');

    const publishRes = await request(`/grading/publish/${cs101Exam.id}`, {
      method: 'POST',
      token: facultyToken,
    });
    assert.strictEqual(publishRes.status, 200);
    assert.strictEqual(publishRes.data.status, 'PUBLISHED');

    const studentResultsAfterPublish = await request('/results/my-results', {
      token: studentToken,
    });
    const publishedCS101 = studentResultsAfterPublish.data.results.find(
      (r: any) => r.courseCode === 'CS101'
    );
    assert.ok(publishedCS101, 'Published result must be visible to student');
    assert.strictEqual(publishedCS101.marksObtained, 89);
    assert.strictEqual(publishedCS101.computedGrade, 'A');
    console.log('✓ Flow C (UC-010) boundary & generation tests passed');

    console.log('\n=========================================');
    console.log('ALL AUTOMATED TESTS PASSED SUCCESSFULLY!');
    console.log('=========================================');

    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('Test execution failed:', err);
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

runTests();
