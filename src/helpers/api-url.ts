import env from "@/config/env";
import { Environment } from "@/enums/environment.enum";

const { NODE_ENV, PORT, API_URL } = env;

let apiUrl: string;

if (NODE_ENV === Environment.PRODUCTION) {
  apiUrl = `${API_URL}`;
} else {
  apiUrl = `http://localhost:${PORT || "3300"}`;
}

export default apiUrl;
