import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

import { API_PREFIX } from "@/constants/constants";
import translate from "@/helpers/translate";
import getAppVersion from "@/helpers/get-app-version";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logoPath = join(__dirname, "../assets/img/logo.png");
const faviconPath = join(__dirname, "../assets/img/favicon.png");

const logo = readFileSync(logoPath);
const favicon = readFileSync(faviconPath);

const fastifySwaggerOptions = {
  openapi: {
    info: {
      title: translate("schema.info.title"),
      description: translate("schema.info.description"),
      version: getAppVersion(),
    },
    components: {
      securitySchemes: {
        refreshTokenCookie: {
          type: "apiKey" as const,
          in: "cookie" as const,
          name: "refreshToken",
          description: translate("schema.security.description"),
        },
      },
    },
  },
  transform: jsonSchemaTransform,
};

const fastifySwaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: `${API_PREFIX}/docs`,
  logo: {
    type: "image/png",
    content: logo,
  },
  theme: {
    css: [
      {
        filename: "swagger-custom.css",
        content: `
          .topbar-wrapper img {
            height: 80px !important;
            width: auto !important;
          }

          .swagger-ui .auth-wrapper,
          .swagger-ui .scheme-container {
            display: none !important;
          }

          .swagger-ui .renderedMarkdown p {
            font-size: 28px !important;
            font-weight: bold !important;
            margin: 0 !important;
          }

          .swagger-ui .info {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            margin: 10px 0 !important;
          }
          
          .swagger-ui .info:after {
            content: "";
            display: block;
            width: 300px;
            height: 120px;
            background-image: url("/public/img/logo.png");
            background-repeat: no-repeat;
            background-size: contain;
            background-position: right center;
          }
        `,
      },
    ],
    favicon: [
      {
        filename: "favicon.png",
        rel: "icon",
        sizes: "64x64",
        type: "image/png",
        content: favicon,
      },
    ],
  },
};

export { fastifySwaggerOptions, fastifySwaggerUiOptions };
