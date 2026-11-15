import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";

// Check before spawning either service so a failed second launch cannot leave an orphan API.
async function checkPort(port: number) {
  await new Promise<void>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
}
try {
  await Promise.all([
    checkPort(Number(process.env.PORT || 3001)),
    checkPort(5173),
  ]);
} catch (error) {
  console.error(
    `ExamEase could not start: ${(error as Error).message}\nClose the previous development server with Ctrl+C, then run npm run dev again.`,
  );
  process.exit(1);
}
const children = [
  spawn(
    process.execPath,
    ["--experimental-sqlite", "--import", "tsx", "--watch", "server/index.ts"],
    { stdio: "inherit" },
  ),
  spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"],
    { stdio: "inherit" },
  ),
];
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => {
    if (child.exitCode !== null || !child.pid) return;
    if (process.platform === "win32")
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
    else child.kill("SIGTERM");
  });
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) =>
  child.on("exit", (code) => {
    if (!stopping) {
      stop();
      process.exitCode = code || 0;
    }
  }),
);
