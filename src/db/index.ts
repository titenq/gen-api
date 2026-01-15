import mongoose from "mongoose";

import env from "@/config/env";
import createAdmin from "@/seeds/create-admin";
import translate from "@/helpers/translate";

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = env;

const connectionString = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_NAME}`;

mongoose.set("strictQuery", true);
mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, { autoIndex: true });

    mongoose.connection.useDb(DB_NAME);
    console.log(translate("message.mongodb.success"));

    await createAdmin();
  } catch (_error) {
    console.error(translate("message.mongodb.error"));
  }
};

connectDB();

export default mongoose;
