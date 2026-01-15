import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import client from "prom-client";

import { API_PREFIX } from "@/constants/constants";
import translate from "@/helpers/translate";

const prometheusPlugin: FastifyPluginAsync = async (app) => {
  const register = new client.Registry();

  client.collectDefaultMetrics({ register });

  const inflightRequests = new client.Gauge({
    name: "http_inflight_requests",
    help: translate("message.prometheus.httpInflightRequests"),
  });

  app.addHook("onRequest", (req, reply, done) => {
    inflightRequests.inc();

    done();
  });

  app.addHook("onResponse", (req, reply, done) => {
    inflightRequests.dec();

    done();
  });

  const httpRequests = new client.Counter({
    name: "http_requests_total",
    help: translate("message.prometheus.httpRequestsTotal"),
    labelNames: ["method", "route", "status_code"],
  });

  register.registerMetric(httpRequests);

  const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: translate("message.prometheus.httpRequestDurationSeconds"),
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  });

  register.registerMetric(httpRequestDuration);

  app.addHook("onRequest", async (req) => {
    req.startEpoch = Date.now();
  });

  app.addHook("onResponse", async (req, reply) => {
    const responseTimeInSeconds = (Date.now() - req.startEpoch!) / 1000;

    httpRequests.inc({
      method: req.method,
      route: req.routeOptions?.url || req.url,
      status_code: reply.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.routeOptions?.url || req.url,
        status_code: reply.statusCode,
      },
      responseTimeInSeconds,
    );
  });

  app.get(`${API_PREFIX}/metrics`, async (req, reply) => {
    reply.header("Content-Type", register.contentType);

    return register.metrics();
  });
};

export default fp(prometheusPlugin);
