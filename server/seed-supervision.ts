import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { openRepository, type Repository } from "./db.js";
import { hashPassword } from "./services/auth.js";

export const TA_DEMO_PASSWORD = "ExamEase@2026";
/** Add only missing fictional TAs; never reset an existing account or add duties implicitly. */
export function seedTeachingAssistants(repo: Repository) {
  const names = [
    "Aditi Joshi",
    "Kabir Malhotra",
    "Nisha Iyer",
    "Arjun Nair",
    "Sara Khan",
    "Dev Shah",
  ];
  return repo.transaction(() => {
    let added = 0;
    names.forEach((name, index) => {
      const email = `ta${index + 1}@examease.local`;
      if (repo.one("SELECT id FROM users WHERE email=?", email)) return;
      repo.insert("users", {
        id: randomUUID(),
        email,
        name,
        role: "TA",
        department: "Computer Science",
        password_hash: hashPassword(TA_DEMO_PASSWORD),
        active: 1,
        created_at: new Date().toISOString(),
      });
      added++;
    });
    return added;
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const repo = openRepository();
  try {
    console.log(
      `${seedTeachingAssistants(repo)} demonstration TA accounts added; existing accounts retained.`,
    );
  } finally {
    repo.close();
  }
}
