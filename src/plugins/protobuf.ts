import path from "node:path";
import fs from "node:fs";

import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import protobuf from "protobufjs";

export interface ProtobufPluginOptions {
  protoDir?: string;
}

const collectTypes = (
  namespace: protobuf.NamespaceBase,
  types: Record<string, protobuf.Type>,
) => {
  if (!namespace.nested) {
    return;
  }

  for (const key of Object.keys(namespace.nested)) {
    const nested = namespace.nested[key];

    if (nested instanceof protobuf.Type) {
      types[nested.fullName.replace(/^\./, "")] = nested;
    } else if (nested instanceof protobuf.Namespace) {
      collectTypes(nested, types);
    }
  }
};

const toTimestamp = (date: Date | string | number | null | undefined) => {
  if (!date) {
    return undefined;
  }

  const d = new Date(date);

  return {
    seconds: Math.floor(d.getTime() / 1000),
    nanos: (d.getTime() % 1000) * 1_000_000,
  };
};

const protobufPlugin = fp<ProtobufPluginOptions>(
  async (fastify: FastifyInstance, opts) => {
    const protoDir = opts.protoDir || path.join(process.cwd(), "proto");
    const files = fs.readdirSync(protoDir).filter((f) => f.endsWith(".proto"));
    const roots: protobuf.Root[] = [];

    for (const file of files) {
      const root = await protobuf.load(path.join(protoDir, file));
      roots.push(root);
    }

    const types: Record<string, protobuf.Type> = {};

    for (const root of roots) {
      collectTypes(root, types);
    }

    fastify.decorate("protobuf", {
      types,
      getType(name: string) {
        return types[name];
      },
    });

    fastify.addHook(
      "preSerialization",
      async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        const accept = request.headers["accept"];

        if (accept && accept.includes("application/x-protobuf")) {
          if (Buffer.isBuffer(payload)) {
            return payload;
          }

          if (payload && typeof payload === "object") {
            const transformedPayload = { ...payload };

            if (transformedPayload._id) {
              transformedPayload._id = transformedPayload._id.toString();
            }

            transformedPayload.createdAt = toTimestamp(
              transformedPayload.createdAt,
            );

            transformedPayload.updatedAt = toTimestamp(
              transformedPayload.updatedAt,
            );

            payload = transformedPayload;
          }

          let protobufType =
            (reply as any).protobufType ||
            (request.routeOptions.config as any)?.protobufType;

          if (payload && payload.error && types["error.GenericError"]) {
            protobufType = "error.GenericError";
          }

          if (!protobufType) {
            return payload;
          }

          const type = types[protobufType];

          if (!type) {
            fastify.log.error(`Protobuf type not found: ${protobufType}`);

            return payload;
          }

          const errMsg = type.verify(payload);

          if (errMsg) {
            fastify.log.error(`Invalid payload for ${protobufType}: ${errMsg}`);

            return payload;
          }

          const message = type.create(payload);
          const buffer = type.encode(message).finish();

          reply.header("Content-Type", "application/x-protobuf");

          return buffer;
        }

        return payload;
      },
    );
  },
) as unknown as FastifyPluginAsync<ProtobufPluginOptions>;

export default protobufPlugin;
