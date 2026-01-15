import env from "@/config/env";

const { NODE_ENV, ORIGIN } = env;

let siteOrigin: string;

if (NODE_ENV === "development") {
  siteOrigin = "http://localhost:5173";
} else {
  siteOrigin = ORIGIN || "";
}

export default siteOrigin;
