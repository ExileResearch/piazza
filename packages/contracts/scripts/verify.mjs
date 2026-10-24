import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

for (const script of ["check", "build", "test", "lint"]) {
  const result = spawnSync("npm", ["run", script], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
