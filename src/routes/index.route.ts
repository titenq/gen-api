import { readdirSync } from "node:fs";
import { resolve } from "node:path";

import { FastifyInstance } from "fastify";

import { API_PREFIX } from "@/constants/constants";

const indexRoute = async (fastify: FastifyInstance) => {
  const files = readdirSync(resolve(process.cwd(), "src", "routes")).filter(
    (file) => {
      const isTsFile = file.endsWith(".ts") && file !== "index.route.ts";
      const isJsFile = file.endsWith(".js") && file !== "index.route.js";

      return isTsFile || isJsFile;
    },
  );

  for (const file of files) {
    const routeModule = await import(
      resolve(process.cwd(), "src", "routes", file)
    );

    fastify.register(routeModule, { prefix: API_PREFIX });
  }
};

export default indexRoute;
