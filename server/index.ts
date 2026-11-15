import { openRepository } from "./db.js";
import { createApp } from "./app.js";
const repo = openRepository();
const server = createApp(repo).listen(
  Number(process.env.PORT || 3001),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `ExamEase API: http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 3001}`,
    ),
);
function stop() {
  server.close(() => {
    repo.close();
    process.exit(0);
  });
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
