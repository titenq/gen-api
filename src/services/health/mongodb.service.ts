import mongoose from "mongoose";

import { MongoDBStatus } from "@/enums/health.enum";
import translate from "@/helpers/translate";
import { HealthInterface } from "@/interfaces";

const mongoDBService = async (): Promise<HealthInterface.IHealthMongoDB> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        status: MongoDBStatus.DOWN,
        error: translate("message.mongodb.connectionNotReady"),
      };
    }

    const start = Date.now();

    await mongoose.connection.db?.admin().ping();

    const latency = Date.now() - start;

    return {
      status: MongoDBStatus.OK,
      latency,
    };
  } catch (_error) {
    return {
      status: MongoDBStatus.DOWN,
      error: translate("message.mongodb.connectionFailed"),
    };
  }
};

export default mongoDBService;
