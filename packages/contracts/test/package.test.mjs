import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}

test("packed file dependencies resolve runtime and inferred types in isolated ESM/CJS consumers", () => {
  const temp = mkdtempSync(join(tmpdir(), "piazza-contracts-"));
  try {
    const cache = join(temp, "npm-cache");
    const pack = (cwd) =>
      JSON.parse(
        run(
          "npm",
          [
            "pack",
            "--json",
            "--ignore-scripts",
            "--offline",
            "--cache",
            cache,
            "--pack-destination",
            temp,
          ],
          cwd,
        ),
      )[0];
    const library = pack(root);
    const peer = pack(join(root, "node_modules", "zod"));
    assert.equal(
      library.files.some((file) => file.path.startsWith("node_modules/")),
      false,
    );
    assert.equal(
      library.files.some((file) => file.path.startsWith("src/")),
      false,
    );
    assert.equal(
      library.files.some((file) => file.path === "dist/cjs/index.d.ts"),
      true,
    );
    const consumer = join(temp, "consumer");
    mkdirSync(consumer);
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: {
          "@piazza/contracts": `file:../${library.filename}`,
          zod: `file:../${peer.filename}`,
        },
      }),
    );
    run(
      "npm",
      [
        "install",
        "--offline",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--cache",
        cache,
      ],
      consumer,
    );
    const fixture = `
import { registerRequestSchema } from '@piazza/contracts';
import type { RegisterRequest, CurrentUser } from '@piazza/contracts';
import { authTokenSchema } from '@piazza/contracts/server-internal';
// @ts-expect-error Persistence schemas are intentionally not root exports.
import { userSchema } from '@piazza/contracts';
const request: RegisterRequest = { email: 'A@Example.test', password: 'long-example-password' };
const parsed = registerRequestSchema.parse(request);
const locale: 'en' | 'fr' | 'es' | 'pa' | 'zh' = parsed.locale;
function safeUser(user: CurrentUser) {
  // @ts-expect-error A current-user DTO has no stored password hash.
  return user.passwordHash;
}
void [locale, safeUser, authTokenSchema, userSchema];
`;
    for (const extension of ["mts", "cts"]) {
      const file = `types.${extension}`;
      writeFileSync(join(consumer, file), fixture);
      run(
        process.execPath,
        [
          join(root, "node_modules/typescript/bin/tsc"),
          "--strict",
          "--noEmit",
          "--module",
          "NodeNext",
          "--moduleResolution",
          "NodeNext",
          "--target",
          "ES2023",
          "--skipLibCheck",
          "false",
          file,
        ],
        consumer,
      );
    }
    writeFileSync(
      join(consumer, "esm.mjs"),
      `
import assert from 'node:assert/strict';
import { registerRequestSchema } from '@piazza/contracts';
assert.equal(registerRequestSchema.parse({email:'A@Example.test',password:'long-example-password'}).email,'a@example.test');
`,
    );
    writeFileSync(
      join(consumer, "cjs.cjs"),
      `
const assert = require('node:assert/strict');
const c = require('@piazza/contracts');
assert.equal(c.pageQuerySchema.parse({}).pageSize,20);
assert.equal('userSchema' in c,false);
assert.equal(typeof require('@piazza/contracts/server-internal').userSchema.parse,'function');
`,
    );
    run(process.execPath, ["esm.mjs"], consumer);
    run(process.execPath, ["cjs.cjs"], consumer);
    const installed = JSON.parse(
      readFileSync(
        join(consumer, "node_modules/@piazza/contracts/package.json"),
        "utf8",
      ),
    );
    assert.equal(installed.name, "@piazza/contracts");
    assert.equal("workspaces" in installed, false);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
