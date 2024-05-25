import crypto from "crypto";

// Function to encrypt a string with deterministic output
export function encryptString(text, secretKey, algorithm) {
  // Use a fixed initialization vector (iv) for deterministic encryption
  const iv = Buffer.from("0123456789abcdef0123456789abcdef", "hex");
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Function to decrypt a string
export function decryptString(text, secretKey, algorithm) {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
