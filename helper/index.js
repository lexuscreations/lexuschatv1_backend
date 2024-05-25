import crypto from "crypto";

import {
  getDB_ENCRYPTION_KEY,
  getENCRYPTION_ALGORITHM,
} from "../config/index.js";

const getEncryptDecryptVars = (IV_FROM_OBJ) => {
  const DB_ENCRYPTION_KEY = getDB_ENCRYPTION_KEY();
  const ENCRYPTION_ALGORITHM = getENCRYPTION_ALGORITHM();

  let IV;

  if (IV_FROM_OBJ) IV = Buffer.from(IV_FROM_OBJ.iv, IV_FROM_OBJ.type);
  else IV = crypto.randomBytes(16);

  return { ENCRYPTION_ALGORITHM, DB_ENCRYPTION_KEY, IV };
};

const encryptMsg = (message) => {
  const { ENCRYPTION_ALGORITHM, DB_ENCRYPTION_KEY, IV } =
    getEncryptDecryptVars();

  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    DB_ENCRYPTION_KEY,
    IV
  );

  const encryptedData = cipher.update(message, "utf-8", "hex");

  const final_encrypted_message = encryptedData + cipher.final("hex");

  const base64data_iv = Buffer.from(IV, "binary").toString("base64");

  return { base64data_iv, final_encrypted_message };
};

const decryptMsg = (msgObj) => {
  const { ENCRYPTION_ALGORITHM, DB_ENCRYPTION_KEY, IV } = getEncryptDecryptVars(
    { iv: msgObj.iv, type: "base64" }
  );

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    DB_ENCRYPTION_KEY,
    IV
  );

  const decryptedData = decipher.update(msgObj.msg, "hex", "utf-8");

  const final_encrypted_message = decryptedData + decipher.final("utf8");

  return final_encrypted_message;
};

export { encryptMsg, decryptMsg };
