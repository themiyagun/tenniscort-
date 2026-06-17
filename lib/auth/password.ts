// Password hashing using Node's built-in scrypt — no native dependencies, so it
// works everywhere (including Windows) without a build step.
import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 64;

/** Returns "salt:hash" (hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEYLEN);
  return `${salt}:${derived.toString("hex")}`;
}

/** Constant-time compare of a plaintext password against a stored "salt:hash". */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, salt, KEYLEN);
  return hash.length === derived.length && timingSafeEqual(hash, derived);
}
