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

export function decryptCredential(value?: string | null) {
  if (!value) return value ?? null;

  const [prefix, ivEncoded, tagEncoded, ciphertextEncoded, ...extra] = value.split(".");
  if (prefix !== PREFIX || !ivEncoded || !tagEncoded || ciphertextEncoded === undefined || extra.length > 0) {
    throw new Error("Unsupported or malformed encrypted credential");
  }

  try {
    const iv = Buffer.from(ivEncoded, "base64url");
    const tag = Buffer.from(tagEncoded, "base64url");
    const ciphertext = Buffer.from(ciphertextEncoded, "base64url");
    if (iv.length !== 12 || tag.length !== 16) {
      throw new Error("Invalid encrypted credential parameters");
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Unable to decrypt agent credential; verify CREDENTIAL_ENCRYPTION_KEY");
  }
}
