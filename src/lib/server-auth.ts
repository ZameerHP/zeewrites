import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "zeewrites_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// In-memory rate limiting map for login attempts
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

function getSecretKey(): string {
  // Use ADMIN_SESSION_SECRET or fall back to SUPABASE_SERVICE_ROLE_KEY or default
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "zeewrites-session-secret-key-32-bytes-needed"
  );
}

/**
 * Sign session token: timestamp:expiresAt:hmac
 */
export function createSessionToken(): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MAX_AGE * 1000;
  const payload = `${issuedAt}:${expiresAt}`;
  const hmac = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");
  return `${payload}:${hmac}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [issuedAtStr, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const payload = `${issuedAtStr}:${expiresAtStr}`;
  const expectedHmac = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");

  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Check if current server request has valid admin auth
 */
export async function isAuthenticatedAdmin(req?: Request): Promise<boolean> {
  // 1. Check Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (verifySessionToken(token)) return true;
    }

    // 2. Direct Cookie header check
    const rawCookie = req.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(
        new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
      );
      if (match && match[1] && verifySessionToken(decodeURIComponent(match[1]))) {
        return true;
      }
    }
  }

  // 3. Next.js cookies() store
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie && verifySessionToken(sessionCookie.value)) {
      return true;
    }
  } catch {
    // cookies() may throw outside request context
  }

  return false;
}

/**
 * Rate limit login attempts
 */
export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const rec = loginRateLimitMap.get(ip);
  if (!rec) return { allowed: true };

  if (rec.lockoutUntil > now) {
    const waitSeconds = Math.ceil((rec.lockoutUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordLoginAttempt(ip: string, success: boolean): void {
  const now = Date.now();
  let rec = loginRateLimitMap.get(ip);
  if (!rec) {
    rec = { attempts: 0, lockoutUntil: 0 };
    loginRateLimitMap.set(ip, rec);
  }

  if (success) {
    loginRateLimitMap.delete(ip);
    return;
  }

  rec.attempts += 1;
  if (rec.attempts >= 5) {
    rec.lockoutUntil = now + 60 * 1000; // 60s lockout after 5 fails
    rec.attempts = 0;
  }
}

const AUTH_SALT = "zeewrites-admin-auth-salt-v1";

function hashSecret(input: string): Buffer {
  return crypto.scryptSync(input, AUTH_SALT, 64);
}

/**
 * Verify credentials against environment variables
 * ADMIN_PASSPHRASE and ADMIN_PIN
 * Uses salted scrypt hashing and constant-time buffer comparison.
 */
export function verifyCredentials(passphrase: string, pin: string): boolean {
  const envPass = process.env.ADMIN_PASSPHRASE || "zeewrites-master-vault";
  const envPin = process.env.ADMIN_PIN || "202600";

  try {
    const inputPassHash = hashSecret(passphrase);
    const expectedPassHash = hashSecret(envPass);
    const passMatch = crypto.timingSafeEqual(inputPassHash, expectedPassHash);

    const inputPinHash = hashSecret(pin);
    const expectedPinHash = hashSecret(envPin);
    const pinMatch = crypto.timingSafeEqual(inputPinHash, expectedPinHash);

    return passMatch && pinMatch;
  } catch {
    return false;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };
