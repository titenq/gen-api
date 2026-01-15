import { FastifyRequest } from "fastify";
import type { WebSocket } from "ws";

import { JwtInterface, WSInterface } from "@/interfaces";

const verifyWSRoles = (roles: string[]) => {
  return (request: FastifyRequest, socket: WebSocket) => {
    try {
      const accessToken =
        request.cookies.accessToken ||
        request.headers.authorization?.split(" ")[1];

      if (!accessToken) {
        const payload: WSInterface.IWSAuthError = {
          code: 4001,
          error: request.i18n.t("error.handler.tokenNotProvided"),
        };

        if (socket.readyState === 1) {
          socket.send(JSON.stringify(payload));
        }

        socket.close(payload.code, payload.error);

        return false;
      }

      const decoded = request.server.jwt.verify<
        JwtInterface.IJwtPayload & { roles: string[] }
      >(accessToken);

      const hasAllRoles = roles.every((role) => decoded.roles?.includes(role));

      if (!hasAllRoles) {
        const payload: WSInterface.IWSAuthError = {
          code: 4003,
          error: request.i18n.t("error.handler.unauthorized"),
        };

        if (socket.readyState === 1) {
          socket.send(JSON.stringify(payload));
        }

        socket.close(payload.code, payload.error);

        return false;
      }

      request.user = decoded;

      return true;
    } catch (_error) {
      const payload: WSInterface.IWSAuthError = {
        code: 4002,
        error: request.i18n.t("error.handler.tokenInvalid"),
      };

      if (socket.readyState === 1) {
        socket.send(JSON.stringify(payload));
      }

      socket.close(payload.code, payload.error);

      return false;
    }
  };
};

export default verifyWSRoles;
