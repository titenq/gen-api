import { z } from "zod";

process.loadEnvFile();

import { Environment } from "@/enums/environment.enum";

import translate from "@/helpers/translate";

const envSchema = z.object({
  PORT: z.coerce.number(),
  ORIGIN: z.url(),
  API_URL: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),
  GRAFANA_USER: z.string(),
  GRAFANA_PASSWORD: z.string(),
  RABBITMQ_USER: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  ENC_KEY: z.string(),
  IV: z.string(),
  COOKIE_SECRET: z.string(),
  JWT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_APP_PASSWORD: z.string(),
  EMAIL_SERVICE: z.string(),
  RECAPTCHA_SECRET_KEY: z.string(),
  NODE_ENV: z.enum([
    Environment.DEVELOPMENT,
    Environment.TEST,
    Environment.PRODUCTION,
  ]),
});

type Env = z.infer<typeof envSchema>;

const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  const issues = envResult.error.issues.map(
    (issue) => `${issue.path.join(".")}`,
  );

  console.error(translate("error.invalidEnv"), issues.join(", "));

  process.exit(1);
}

const env: Env = envResult.data;

export default env;
