import {
  devSecretKey,
  readPackageJSON,
  getDecryptedEnvVariable,
  devDefaultServerFallbackAlgorithm,
} from "../utils/index.js";

const packageJsonAppName = readPackageJSON("name") || "test";
const RANDOM_AVATAR_BASE_URL = "https://xsgames.co/randomusers/assets/avatars";

const getEnvValFromProcess = (key, fallback) =>
  getDecryptedEnvVariable(
    key,
    fallback,
    devSecretKey,
    devDefaultServerFallbackAlgorithm
  );

const IS_ENV_TYPE_PROD = getEnvValFromProcess("NODE_ENV", "development");

const FE_URL = getEnvValFromProcess("FE_URL", "http://localhost:3000");
const SERVER_PORT = parseInt(getEnvValFromProcess("SERVER_PORT", 5000), 10);
const ENCRYPTION_ALGORITHM = getEnvValFromProcess(
  "ENCRYPTION_ALGORITHM",
  devDefaultServerFallbackAlgorithm
);
const JWT_SECRET_KEY = getEnvValFromProcess(
  "JWT_SECRET_KEY",
  "fallback--JWT-secret-key"
);
const DB_ENCRYPTION_KEY = getEnvValFromProcess(
  "DB_ENCRYPTION_KEY",
  devSecretKey
); // For AES, this is always 32
const MONGO_URI = getEnvValFromProcess(
  "MONGO_URI",
  `mongodb://127.0.0.1:27017/${packageJsonAppName}`
);
// const ENCRYPTION_PRIVATE_KEY = getEnvValFromProcess(
//   "ENCRYPTION_PRIVATE_KEY",
//   "fallback--encryption-private-key"
// ); // For AES, this is always 32

const getFE_URL = () => FE_URL;
const getMONGO_URI = () => MONGO_URI;
const getSERVER_PORT = () => SERVER_PORT;
const getDevSecretKey = () => devSecretKey;
const getJWT_SECRET_KEY = () => JWT_SECRET_KEY;
const getIS_ENV_TYPE_PROD = () => IS_ENV_TYPE_PROD;
const getDB_ENCRYPTION_KEY = () => DB_ENCRYPTION_KEY;
const getPackageJsonAppName = () => packageJsonAppName;
const getENCRYPTION_ALGORITHM = () => ENCRYPTION_ALGORITHM;
const getRANDOM_AVATAR_BASE_URL = () => RANDOM_AVATAR_BASE_URL;
// const getENCRYPTION_PRIVATE_KEY = () => ENCRYPTION_PRIVATE_KEY;
const getDevDefaultServerFallbackAlgorithm = () =>
  devDefaultServerFallbackAlgorithm;

export {
  getFE_URL,
  getMONGO_URI,
  getSERVER_PORT,
  getDevSecretKey,
  getJWT_SECRET_KEY,
  getIS_ENV_TYPE_PROD,
  getDB_ENCRYPTION_KEY,
  getPackageJsonAppName,
  getENCRYPTION_ALGORITHM,
  getRANDOM_AVATAR_BASE_URL,
  // getENCRYPTION_PRIVATE_KEY,
  getDevDefaultServerFallbackAlgorithm,
};
