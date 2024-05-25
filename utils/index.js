import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import { decryptString, encryptString } from "./cryptoUtils.js";

// IMPORTANT: Do not modify this devSecretKey. If changes are made, ensure all environment variables in .env are re-encrypted with the updated key, and all database too  // And most important for AES, this is always be 32 bits
const devSecretKey = "sdjh2kj35h2knk23no23kmpmdp23r34p";

const devDefaultServerFallbackAlgorithm = "aes-256-cbc";

const __filename = fileURLToPath(import.meta.url);
const __dirname_or_currentDir = path.dirname(__filename);
const tillRootDirPath = path.resolve(__dirname_or_currentDir, "../");

const envPath = path.resolve(tillRootDirPath, "gitignore_folder", ".env");

dotenv.config({ path: envPath });

const getRandomNumber = (maxLength) => ~~(Math.random() * maxLength);

// Function to read package.json and extract data based on keys
const readPackageJSON = (keys) => {
  const packagePath = path.resolve(tillRootDirPath, "package.json");

  try {
    const packageJSON = fs.readFileSync(packagePath, "utf-8");
    const packageData = JSON.parse(packageJSON);

    if (!keys) {
      // If no keys provided, return the entire package.json
      return packageData;
    }

    if (typeof keys === "string") {
      // If keys is a string, convert it to an array with one element
      keys = [keys];
    }

    if (!Array.isArray(keys)) {
      // If keys is not an array, throw an error
      throw new Error("Keys should be an array or a string");
    }

    const result = [];

    // Iterate through each key
    keys.forEach((key) => {
      let value = packageData;
      const nestedKeys = key.split("/"); // Handle nested keys

      for (const nestedKey of nestedKeys) {
        if (value && value.hasOwnProperty(nestedKey)) {
          value = value[nestedKey];
        } else {
          value = null; // Key not found
          break;
        }
      }

      result.push(value);
    });

    return keys.length === 1 ? result[0] : result;
  } catch (error) {
    // Throw the error instead of logging it
    throw error;
  }
};

const getDecryptedEnvVariable = (
  key,
  fallback,
  devSecretKey,
  devDefaultServerFallbackAlgorithm
) => {
  try {
    const value = process.env[key];
    return value !== undefined
      ? decryptString(value, devSecretKey, devDefaultServerFallbackAlgorithm)
      : fallback;
  } catch (error) {
    console.error(
      `Error retrieving environment variable ${key}: ${error.message}`
    );
    return fallback;
  }
};

const encryptEnv = () => {
  const envFileContent = fs.readFileSync(envPath, "utf-8");

  const envValues = envFileContent
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.startsWith("#"))
    .map((line) => {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=");
      return { key, value: value.trim() };
    });

  const encryptedEnvVarsArr = envValues.map(({ key, value }) => {
    const encryptedValue = encryptString(
      value,
      devSecretKey,
      devDefaultServerFallbackAlgorithm
    );
    return `${key}=${encryptedValue}`;
  });

  const encryptedEnvFileContent = encryptedEnvVarsArr.join("\n");
  fs.writeFileSync(envPath, encryptedEnvFileContent, "utf-8");
};

if (process.argv.slice(2)[0] === "encryptEnv") encryptEnv();

export {
  devSecretKey,
  decryptString,
  encryptString,
  getRandomNumber,
  readPackageJSON,
  getDecryptedEnvVariable,
  devDefaultServerFallbackAlgorithm,
};
