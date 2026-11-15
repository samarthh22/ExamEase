import { openRepository } from "../server/db.js";
import { seed } from "../server/seed.js";
import { createApp } from "../server/app.js";
process.env.PORT = "3002";
process.env.APP_ORIGIN = "http://127.0.0.1:3002";
const repo = openRepository(":memory:");
seed(repo);
const server = createApp(repo).listen(3002, "127.0.0.1", () =>
  console.log("Isolated browser test server ready"),
);
process.on("SIGTERM", () => server.close(() => repo.close()));
