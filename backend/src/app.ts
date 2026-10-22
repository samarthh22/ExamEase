import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import studentsRouter from './routes/students.js';
import facultyRouter from './routes/faculty.js';
import coursesRouter from './routes/courses.js';
import examsRouter from './routes/exams.js';
import registrationsRouter from './routes/registrations.js';
import marksRouter from './routes/marks.js';
import gradingRouter from './routes/grading.js';
import resultsRouter from './routes/results.js';
import reportsRouter from './routes/reports.js';

dotenv.config();

export const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Request logging in development
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'ExamEase API' });
});

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/exams', examsRouter);
app.use('/api/registrations', registrationsRouter);
app.use('/api/marks', marksRouter);
app.use('/api/grading', gradingRouter);
app.use('/api/results', resultsRouter);
app.use('/api/reports', reportsRouter);

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

export default app;
