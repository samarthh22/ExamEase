import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { openRepository } from "../server/db.js";
import { createApp } from "../server/app.js";
import { seed, DEMO_PASSWORD } from "../server/seed.js";
test("NFR-001/002/009 local 300-student department benchmark", async (t) => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    repo.transaction(() => {
      const template = repo.get("users", "u-student-1")!;
      for (let i = 7; i <= 300; i++) {
        repo.insert("users", {
          ...template,
          id: `u-bench-${i}`,
          email: `bench${i}@example.test`,
          name: `Student ${i}`,
        });
        repo.insert("students", {
          id: `s-bench-${i}`,
          user_id: `u-bench-${i}`,
          roll_no: `BENCH${i}`,
          batch_year: 2024,
          department: "Computer Science",
        });
        repo.insert("registrations", {
          id: `r-bench-${i}`,
          student_id: `s-bench-${i}`,
          exam_id: "e-past",
          status: "REGISTERED",
          seat: i,
          created_at: new Date().toISOString(),
        });
      }
    });
    const agent = request.agent(createApp(repo));
    await agent
      .post("/api/auth/login")
      .send({ email: "faculty@examease.local", password: DEMO_PASSWORD })
      .expect(200);
    const marks = repo
      .all<{ student_id: string }>(
        "SELECT student_id FROM registrations WHERE exam_id=?",
        "e-past",
      )
      .map((r, i) => ({ studentId: r.student_id, marksObtained: i % 101 }));
    let start = performance.now();
    await agent.post("/api/marks/exam/e-past").send({ marks }).expect(200);
    const saveMs = performance.now() - start;
    const timings: number[] = [];
    for (let i = 0; i < 30; i++) {
      start = performance.now();
      await agent
        .get(i % 2 ? "/api/reports/courses" : "/api/marks/exam/e-past")
        .expect(200);
      timings.push(performance.now() - start);
    }
    timings.sort((a, b) => a - b);
    const p95 = timings[Math.ceil(timings.length * 0.95) - 1];
    t.diagnostic(
      JSON.stringify({
        students: 300,
        samples: 30,
        marksAndStatisticsMs: Math.round(saveMs),
        readApiP95Ms: Math.round(p95),
      }),
    );
    assert.ok(saveMs < 5000, `Marks/statistics took ${saveMs}ms`);
    assert.ok(p95 < 3000, `Read API p95 took ${p95}ms`);
  } finally {
    repo.close();
  }
});
