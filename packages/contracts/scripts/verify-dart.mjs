import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const cwd = fileURLToPath(new URL("../compat/dart", import.meta.url));
const names = ["lib/models.freezed.dart", "lib/models.g.dart"];
const before = process.argv.includes("--write")
  ? []
  : await Promise.all(names.map((p) => readFile(join(cwd, p), "utf8")));
const state = await mkdtemp(join(tmpdir(), "piazza-dart-analyzer-"));
try {
  for (const args of [
    ["pub", "get", "--enforce-lockfile"],
    ["run", "build_runner", "build"],
    ["format", ...names],
    ["analyze"],
    ["run", "bin/parity.dart", "../../test/parity-fixtures.json"],
  ]) {
    const result = spawnSync(process.env.DART_BIN ?? "dart", args, {
      cwd,
      env: { ...process.env, ANALYZER_STATE_LOCATION_OVERRIDE: state },
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0)
      throw Error(`Dart check failed: ${args.join(" ")}`);
    if (args[0] === "format") {
      // Freezed emits `dart format off`; normalize only insignificant trailing whitespace.
      for (const name of names) {
        const path = join(cwd, name);
        const content = await readFile(path, "utf8");
        const normalized = content.replace(/[\t ]+$/gm, "");
        if (normalized !== content) await writeFile(path, normalized);
      }
    }
  }
  for (let i = 0; !process.argv.includes("--write") && i < names.length; i++)
    if ((await readFile(join(cwd, names[i]), "utf8")) !== before[i])
      throw Error(
        `Freezed regeneration drift: ${names[i]}; regenerate and review artifacts`,
      );
  console.log(
    process.argv.includes("--write")
      ? "Regenerated Dart artifacts for review"
      : "Freezed regeneration matches committed artifacts",
  );
} finally {
  await rm(state, { recursive: true, force: true });
}
