import crypto from "node:crypto";

const PREFIX = "v1";

function getKey() {
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!secret) throw new Error("CREDENTIAL_ENCRYPTION_KEY is required to store agent credentials");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptCredential(value?: string | null) {
  if (!value) return value ?? null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}
