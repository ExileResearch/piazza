import { format } from "prettier";
import { readFile, writeFile } from "node:fs/promises";
import { generateOpenApi, generateToolCatalog } from "./lib/openapi.mjs";
import { generateDart } from "./lib/dart.mjs";
const check = process.argv.includes("--check");
const openapi = generateOpenApi();
const files = new Map([
  ["generated/openapi.json", JSON.stringify(openapi, null, 2) + "\n"],
  [
    "generated/mcp-tools.json",
    JSON.stringify(generateToolCatalog(), null, 2) + "\n",
  ],
  ...generateDart(openapi),
]);
for (const [path, raw] of files) {
  const content = path.endsWith(".json")
    ? await format(raw, { parser: "json" })
    : raw;
  if (check) {
    if ((await readFile(path, "utf8")) !== content)
      throw Error(`Generated drift: ${path}; run npm run generate`);
  } else await writeFile(path, content);
}
console.log(
  `${check ? "Checked" : "Generated"} ${files.size} contract artifacts`,
);
