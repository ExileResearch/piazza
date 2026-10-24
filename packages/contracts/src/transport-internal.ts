/** Pure transport primitives. Keys, cursor handles and authorization snapshots come from trusted server stores. */
import { z } from "zod";
import { digestSchema, idSchema, timestampSchema } from "./common.js";

export const eventCursorRecordSchema = z.strictObject({
  handle: idSchema,
  actorScopeDigest: digestSchema,
  filterDigest: digestSchema,
  issuedAt: timestampSchema,
  expiresAt: timestampSchema,
});
export type EventCursorRecord = z.infer<typeof eventCursorRecordSchema>;

/** Canonical JSON subset used after schema normalization; no secret headers or undefined properties. */
export function canonicalJson(value: unknown): string {
  const seen = new Set<object>();
  function visit(v: unknown, depth: number): string {
    if (depth > 64) throw new Error("JSON depth exceeded");
    if (v === null || typeof v === "boolean") return JSON.stringify(v);
    if (typeof v === "number" && Number.isFinite(v)) return JSON.stringify(v);
    if (
      typeof v === "string" &&
      !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
        v,
      )
    )
      return JSON.stringify(v);
    if (typeof v !== "object" || v === null || seen.has(v))
      throw new Error("Noncanonical JSON value");
    seen.add(v);
    let result: string;
    if (Array.isArray(v))
      result = `[${Array.from(v, (item) => visit(item, depth + 1)).join(",")}]`;
    else {
      if (
        Object.getPrototypeOf(v) !== Object.prototype &&
        Object.getPrototypeOf(v) !== null
      )
        throw new Error("Plain JSON required");
      result = `{${Object.keys(v)
        .sort()
        .map((key) => {
          if (
            /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
              key,
            )
          )
            throw new Error("Invalid Unicode key");
          return `${JSON.stringify(key)}:${visit((v as Record<string, unknown>)[key], depth + 1)}`;
        })
        .join(",")}}`;
    }
    seen.delete(v);
    return result;
  }
  const result = visit(value, 0);
  if (new TextEncoder().encode(result).length > 2_000_000)
    throw new Error("JSON byte limit exceeded");
  return result;
}
export async function payloadDigest(value: unknown): Promise<string> {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonicalJson(value)),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
function decode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid cursor");
  return Uint8Array.from(
    atob(value.replaceAll("-", "+").replaceAll("_", "/")),
    (s) => s.charCodeAt(0),
  );
}
async function key(bytes: Uint8Array) {
  if (bytes.length < 32)
    throw new Error("Dedicated cursor key must have 256 bits");
  return crypto.subtle.importKey(
    "raw",
    new Uint8Array(bytes),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
export async function issueEventCursor(
  record: EventCursorRecord,
  secret: Uint8Array,
): Promise<string> {
  const parsed = eventCursorRecordSchema.parse(record);
  const lifetime = Date.parse(parsed.expiresAt) - Date.parse(parsed.issuedAt);
  if (lifetime <= 0 || lifetime > 900_000)
    throw new Error("Invalid cursor lifetime");
  const body = encode(new TextEncoder().encode(canonicalJson(parsed)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(secret),
    new TextEncoder().encode(`v1.${body}`),
  );
  const cursor = `v1.${body}.${encode(new Uint8Array(signature))}`;
  if (cursor.length > 512) throw new Error("Cursor limit exceeded");
  return cursor;
}
/** Same safe 410 outcome for invalid/expired/foreign scopes. A valid cursor still requires live authorization and handle lookup. */
export async function readEventCursor(
  cursor: string,
  secret: Uint8Array,
  expected: { actorScopeDigest: string; filterDigest: string; now: string },
): Promise<EventCursorRecord | undefined> {
  try {
    if (cursor.length > 512) return undefined;
    const parts = cursor.split(".");
    if (parts.length !== 3 || parts[0] !== "v1") return undefined;
    const [, body, signature] = parts as [string, string, string];
    if (
      !(await crypto.subtle.verify(
        "HMAC",
        await key(secret),
        new Uint8Array(decode(signature)),
        new TextEncoder().encode(`v1.${body}`),
      ))
    )
      return undefined;
    const record = eventCursorRecordSchema.parse(
      JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(decode(body)),
      ),
    );
    const now = Date.parse(timestampSchema.parse(expected.now));
    if (
      record.actorScopeDigest !== expected.actorScopeDigest ||
      record.filterDigest !== expected.filterDigest ||
      Date.parse(record.issuedAt) > now ||
      Date.parse(record.expiresAt) <= now ||
      Date.parse(record.expiresAt) - Date.parse(record.issuedAt) > 900_000
    )
      return undefined;
    return record;
  } catch {
    return undefined;
  }
}
