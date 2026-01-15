import buildApp from "@/app";
import env from "@/config/env";
import apiBaseUrl from "@/helpers/api-base-url";
import translate from "@/helpers/translate";

const { PORT } = env;

const startServer = async () => {
  const app = await buildApp();

  await app.listen({
    port: PORT || 3300,
    host: "0.0.0.0",
    listenTextResolver: (address) =>
      `${translate("message.index.serverStarted")} ${address}`,
  });

  console.log(translate("message.index.serverStarted"), apiBaseUrl);

  console.log(
    translate("message.index.healthEndpoint"),
    `${apiBaseUrl}/health`,
  );
  app.log.info(
    `${translate("message.index.healthEndpoint")} ${apiBaseUrl}/health`,
  );

  console.log(
    translate("message.index.apiDocumentation"),
    `${apiBaseUrl}/docs`,
  );
  app.log.info(
    `${translate("message.index.apiDocumentation")} ${apiBaseUrl}/docs`,
  );

  console.log("Grafana dashboard: http://localhost:3000");
  app.log.info("Grafana dashboard: http://localhost:3000");

  console.log("RabbitMQ management: http://localhost:15672");
  app.log.info("RabbitMQ management: http://localhost:15672");

  const listeners = ["SIGINT", "SIGTERM"];

  listeners.forEach((signal: string) => {
    process.on(signal, async () => {
      await app.close();

      process.exit(0);
    });
  });
};

try {
  await startServer();
} catch (error) {
  console.error(error);

  process.exit(1);
}
