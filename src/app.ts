import { cwd } from "node:process";
import { resolve } from "node:path";

import fastify from "fastify";
import { fastifyCompress } from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import i18n from "fastify-i18n";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import pino from "pino";

import env from "@/config/env";
import logRotate from "@/helpers/log-rotate";
import configRateLimit from "@/config/rate-limit";
import { ACCEPT_LANGUAGE, COMPRESS_THRESHOLD } from "@/constants/constants";
import indexRoute from "@/routes/index.route";
import errorHandler from "@/handlers/error.handler";
import siteOrigin from "@/helpers/site-origin";
import {
  fastifySwaggerOptions,
  fastifySwaggerUiOptions,
} from "@/helpers/swagger-options";
import preSerializationHook from "@/hooks/pre-serialization.hook";
import redisPlugin from "@/plugins/redis";
import protobufPlugin from "@/plugins/protobuf";
import prometheusPlugin from "@/plugins/prometheus";
import rabbitMQPlugin from "@/plugins/rabbitmq";
import websocketPlugin from "@/plugins/websocket";

const { COOKIE_SECRET, JWT_SECRET, NODE_ENV } = env;

const buildApp = async () => {
  const app = fastify({
    logger: {
      timestamp: pino.stdTimeFunctions.isoTime,
      messageKey: "message",
      formatters: {
        level(label) {
          return { level: label };
        },
        bindings({ _pid, _hostname, ...rest }) {
          return rest;
        },
      },
      stream: pino.multistream([
        { stream: process.stdout },
        { stream: logRotate() },
      ]),
    },
    disableRequestLogging: true,
  });

  await app.register(rabbitMQPlugin);
  await app.register(redisPlugin);
  await app.register(websocketPlugin);

  await app.register(protobufPlugin, {
    protoDir: resolve(cwd(), "proto"),
  });

  await app.register(fastifyCompress, {
    global: true,
    encodings: ["zstd", "br", "gzip"],
    threshold: COMPRESS_THRESHOLD,
    customTypes: /^(?!image\/|video\/).*/,
  });

  const messages = {
    "en-US": await import("@/locales/en-US"),
    "pt-BR": await import("@/locales/pt-BR"),
    "es-ES": await import("@/locales/es-ES"),
  };

  await app.register(i18n, {
    fallbackLocale: ACCEPT_LANGUAGE,
    messages,
  });

  await app.register(prometheusPlugin);

  preSerializationHook(app);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  });

  app.register(fastifyCors, {
    origin: [siteOrigin],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Recaptcha-Token",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  app.register(fastifyCookie, {
    secret: COOKIE_SECRET,
    hook: "onRequest",
    parseOptions: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      sameSite: NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
  });

  app.register(fastifyStatic, {
    root: resolve(cwd(), "src", "assets"),
    prefix: "/public/",
  });

  app.register(fastifyJwt, { secret: JWT_SECRET });
  app.register(fastifySwagger, fastifySwaggerOptions);
  app.register(fastifySwaggerUi, fastifySwaggerUiOptions);

  await configRateLimit(app);
  await indexRoute(app);

  return app;
};

export default buildApp;
