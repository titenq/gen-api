import env from "@/config/env";
import { API_PREFIX } from "@/constants/constants";
import { Environment } from "@/enums/environment.enum";

const { NODE_ENV, PORT, API_URL } = env;

let apiBaseUrl: string;

if (NODE_ENV === Environment.PRODUCTION) {
  apiBaseUrl = `${API_URL}${API_PREFIX}`;
} else {
  apiBaseUrl = `http://localhost:${PORT || "3300"}${API_PREFIX}`;
}

export default apiBaseUrl;
