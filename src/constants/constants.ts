import { Languages } from "@/enums/language.enum";

const ACCEPT_LANGUAGE = Languages.EN; // Default language
const ACCESS_TOKEN_EXPIRES = 15 * 60; // 15 minutes
const API_PREFIX = "/api/v1"; // API version prefix
const CACHE_TTL = 60; // 1 minute
const COMPRESS_THRESHOLD = 1024; // 1KB
const EMAIL_VERIFICATION_TOKEN_EXPIRES = 1 * 24 * 60 * 60; // 1 day
const LOG_ROTATE_MAX_FILES = 5; // Number of log files to keep
const LOG_ROTATE_MAX_SIZE = 3 * 1024 * 1024; // 3MB
const LOGO_URL = "https://files.catbox.moe/eyx8z7.jpeg"; // URL of the application logo
const RATE_LIMIT_BAN = 5; // Number of violations before temporary ban
const RATE_LIMIT_MAX = 240; // Max requests allowed per time window
const RATE_LIMIT_TIME_WINDOW = "1 minute"; // Duration of the rate limit window
const RECAPTCHA_SECRET_KEY_TEST = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Only for testing purposes
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7 days

export {
  ACCEPT_LANGUAGE,
  ACCESS_TOKEN_EXPIRES,
  API_PREFIX,
  CACHE_TTL,
  COMPRESS_THRESHOLD,
  EMAIL_VERIFICATION_TOKEN_EXPIRES,
  LOG_ROTATE_MAX_FILES,
  LOG_ROTATE_MAX_SIZE,
  LOGO_URL,
  RATE_LIMIT_BAN,
  RATE_LIMIT_MAX,
  RATE_LIMIT_TIME_WINDOW,
  RECAPTCHA_SECRET_KEY_TEST,
  REFRESH_TOKEN_EXPIRES,
};
