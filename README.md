# GEN-API

![](https://img.shields.io/github/stars/titenq/gen-api.svg) ![](https://img.shields.io/github/forks/titenq/gen-api.svg) ![](https://img.shields.io/github/issues/titenq/gen-api.svg)

![gen-api.png](https://files.catbox.moe/eyx8z7.jpeg)

## 📋 Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (>=22)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Create the `.env` file in the root of the project with the variables from the `.env.example` file.

```bash
PORT=3300
ORIGIN=https://frontend.com
API_URL=https://backend.com

ADMIN_NAME=your_name

ADMIN_EMAIL=your_email
ADMIN_PASSWORD=your_password

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=mongo
DB_NAME=api
DB_PORT=27016

REDIS_HOST=redis
REDIS_PORT=6378
REDIS_PASSWORD=123456

GRAFANA_USER=your_grafana_user
GRAFANA_PASSWORD=your_grafana_password

RABBITMQ_USER=your_rabbitmq_user
RABBITMQ_PASSWORD=your_rabbitmq_password

ENC_KEY=1d7a036698f35fbddd3b465c170e8de5
IV=735f67f9a0da1dc6

COOKIE_SECRET=d0e5fccd2f4dd6332def903a5f588834b31d6e28643bcd5ca8d76295051eb52de54b87b657bf295a0af881b06468a961219539fcd591ac67e3bebe5a06547c21

JWT_SECRET=6ba8b7e3e36fd252e43da755406187bdc4241621b716048770f8406803dc2bfad59d781822160463a3ad52e166aec7a16e9ac788f505d438056fb9ec26ea44e5

EMAIL_USER=your_email
EMAIL_APP_PASSWORD=your_email_app_password
EMAIL_SERVICE=your_email_service

RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

NODE_ENV=development
```

## 🚀 How to use

1. Clone the repository:

```bash
git clone https://github.com/titenq/gen-api.git
```

2. Install dependencies:

```bash
npm install
```

3. Build the Docker images:

```bash
npm run docker:build
```

4. Start the application:

```bash
npm run docker:up
```

## 🛠️ Technologies used

- TypeScript
- Node.js
- Fastify
- MongoDB
- Docker
- Zod
- Swagger
- reCAPTCHA
- NodeMailer
- JWT
- Cookie
- Argon2
- Oxlint
- Prettier
- Husky
- Helmet
- Rate Limit
- CORS
- Static
- i18n
- Prometheus
- Grafana
- Protobuf
- Compress
- Redis
- Pino
- WebSocket
- RabbitMQ
- Vitest

## 🐳 Docker

### Development

To run the project with Docker in development mode:

```bash
npm run docker:up
```

The `docker-compose.yml` file is pre-configured with all necessary dependencies.

### Production

To run the project with Docker in production mode (ignoring local overrides):

```bash
npm run docker:prod
```

### Commands

To stop the project:

```bash
npm run docker:down
```

To remove volumes:

```bash
npm run docker:down-v
```

## ⚙️ Configuration

To set the global constants for the project, edit the following file:

> `src/constants/constants.ts`

Default values:

```typescript
const ACCEPT_LANGUAGE = Languages.EN; // Default language
const ACCESS_TOKEN_EXPIRES = 15 * 60; // 15 minutes
const API_PREFIX = "/api/v1"; // API version prefix
const CACHE_TTL = 60; // 1 minute
const COMPRESS_THRESHOLD = 1024; // 1KB
const EMAIL_VERIFICATION_TOKEN_EXPIRES = 1 * 24 * 60 * 60; // 1 day
const LOG_ROTATE_MAX_FILES = 5; // Number of log files to keep
const LOG_ROTATE_MAX_SIZE = 3 * 1024 * 1024; // 3MB
const LOGO_URL = "https://files.catbox.moe/eyx8z7.jpeg"; // URL of the application logo
const RATE_LIMIT_BAN = 5; // Number of violations before temporary ban
const RATE_LIMIT_MAX = 240; // Max requests allowed per time window
const RATE_LIMIT_TIME_WINDOW = "1 minute"; // Duration of the rate limit window
const RECAPTCHA_SECRET_KEY_TEST = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Only for testing purposes
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7 days
```

## 🏥 Health route

```bash
http://localhost:3300/api/v1/health
```

#### Output:

```json
{
  "status": "OK",
  "timestamp": "2025-12-10T13:37:50.730Z",
  "version": "1.0.0",
  "uptime": "00:02:57.563",
  "uptimeSeconds": 177.563847388,
  "dependencies": {
    "mongoDB": {
      "status": "OK",
      "latency": 2
    },
    "redis": {
      "status": "OK",
      "latency": 2
    },
    "rabbitMQ": {
      "status": "OK",
      "latency": 17
    }
  }
}
```

## 🐶 Husky pre-commit

When making a commit, the Git **pre-commit** hook is executed automatically. The commit will only be accepted after the code:

1. Is **formatted with Prettier**, ensuring consistent style across all tracked files.
2. Passes **linting with Oxlint**, enforcing coding best practices and style rules.
3. Is validated by the **TypeScript type-check**, preventing type errors before the commit.
4. Passes **tests with Vitest**, ensuring that the application logic remains intact and error-free.

This hook helps maintain code quality and integrity, avoiding commits that contain formatting, style, type issues, or failing tests.

## 🌐 i18n

Internationalization support for the API.

The API supports multiple languages by default, including English, Brazilian Portuguese and Spanish.

The default language is English, but you can change it by setting the `Accept-Language` header to the desired language code.

For example, to set the language to Spanish, set the `Accept-Language` header to `es-ES`. The API will then return responses in the specified language.

You can also modify the default language in the `src/constants/constants.ts` file:

```typescript
const ACCEPT_LANGUAGE = Languages.PT;
```

The API also supports the following languages:

- English (en-US)
- Brazilian Portuguese (pt-BR)
- Spanish (es-ES)

To add more languages, create a new translation file in the `src/locales` directory with the desired language code. For example, to add French support, create a `fr-FR.ts` file and add the necessary translations.

#### Usage

When the `fastify` instance is available:

```typescript
fastify.i18n.t("error.auth.emailAlreadyExists");
```

When the `request` instance is available:

```typescript
request.i18n.t("error.auth.tokenNotProvided");
```

When there is no instance, for example, in `index.ts`:

```typescript
console.log(translate("message.index.serverStarted"));
```

In `schemas`:

> For non-error messages, such as in `summary` and `tags`, use the `translate` function to translate the `strings`.

```typescript
summary: translate("schema.summary.login"),
tags: [translate("schema.tags.authentication")],
```

> For error messages, use the `strings` directly because they will be translated by `src/handlers/error.handler.ts`:

```typescript
const nameSchema = z
  .string("validation.name.required")
  .min(3, { error: "validation.name.min" })
  .max(32, { error: "validation.name.max" });
```

> In `Enums`, follow the `RolesEnum` example in `src/schemas/shared.schema.ts`:

```typescript
import { Roles } from "@/enums/user.enum";

const RolesEnum = z.enum(Roles, {
  error: "validation.rolesEnum",
});

const rolesSchema = z.array(RolesEnum);
```

## 🚦 Rate limit

To set the constants for the **RATE_LIMIT_BAN**, **RATE_LIMIT_MAX** and **RATE_LIMIT_TIME_WINDOW** globally, edit the following file:

> `src/constants/constants.ts`

Default values:

```typescript
const RATE_LIMIT_BAN = 3; // Number of violations before temporary ban
const RATE_LIMIT_MAX = 240; // Max requests allowed per time window
const RATE_LIMIT_TIME_WINDOW = "1 minute"; // Duration of the rate limit window
```

To configure rate limiting for a specific route, add the config object:

```typescript
routeOptions.post<{
  Headers: AuthInterface.ILoginHeaders;
  Body: AuthInterface.ILoginBody;
}>(
  "/auth/login",
  {
    schema: authSchema.loginSchema,
    preHandler: [verifyRecaptcha],
    config: {
      rateLimit: {
        max: 5,
        timeWindow: "1 minute",
        ban: 5,
      },
    },
  },
  authController.login,
);
```

To disable rate limiting for a specific route, add the config object:

```typescript
routeOptions.get(
  "/health",
  {
    schema: healthSchema,
    config: {
      rateLimit: false,
    },
  },
  healthController,
);
```

## 🌱 Seeds

- `src/seeds/create-admin.ts`
- `src/seeds/create-users.ts`
- `src/seeds/delete-users.ts`

The ADMIN user is automatically created upon project startup, based on the `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment variables.

To create fake users:

```bash
npm run seed:create-users
```

To delete fake users:

```bash
npm run seed:delete-users
```

## 🗜️ Compress

Supports br, gzip, and zstd encodings.

Simply send the request with the `Accept-Encoding` header set to `zstd`, `br`, or `gzip`.

```bash
headers: {
  "Accept-Encoding": "zstd, br, gzip"
}
```

| Encoding | Size    |
| -------- | ------- |
| without  | 20.3 KB |
| gzip     | 1883 B  |
| br       | 1511 B  |
| zstd     | 1485 B  |

## 🔴 Redis

#### Usage

When the `request` instance is available:

```typescript
// Use the cache helper (automatic serialization/deserialization and revival of dates)
const user = await request.server.cache<
  UserInterface.IGetUserByIdResponse | ErrorInterface.IGenericError
>(
  `user:${id}`,
  CACHE_TTL, // imported from constants
  async () => {
    // If the key is found in Redis, this function is NOT executed
    // If NOT found, this function is executed and the result is saved in Redis
    return await getUserByIdService(id);
  },
  request,
);
```

## 🐰 RabbitMQ

RabbitMQ is used as a message broker for asynchronous processing and WebSocket message distribution.

#### Usage

The API uses RabbitMQ to:

- Send emails asynchronously (Forgot Password, Verification).
- Distribute WebSocket events (e.g., new user registration) across instances.

**Consumers (`src/consumers`):**

- `forgot-password.consumer.ts`
- `verification-email.consumer.ts`

**Exchanges:**

- `ws_register_exchange`: Fanout exchange for broadcasting user registration events.

#### Management Interface

```bash
http://localhost:15672
```

- **User**: Defined in `.env` (Default: `guest`)
- **Password**: Defined in `.env` (Default: `guest`)

## 📊 Prometheus

Prometheus is used for collecting API metrics.

#### Metrics Endpoint

The metrics are exposed at:

```bash
http://localhost:3300/api/v1/metrics
```

#### Collected Metrics

- `http_requests_total`: Total number of HTTP requests.
- `http_request_duration_seconds`: Histogram of request durations.
- `http_inflight_requests`: Gauge of current concurrent requests.
- Default Node.js metrics (event loop lag, memory usage, etc.).

## 📈 Grafana

Grafana is used to visualize the metrics collected by Prometheus.

#### Dashboard

```bash
http://localhost:3000
```

- **User**: Defined in `.env`
- **Password**: Defined in `.env`

The project includes a pre-configured dashboard located at `grafana/dashboard.json`. It is automatically provisioned on startup.

## 🧪 Tests

#### Vitest

```bash
npm test
```

#### Coverage

```bash
npm run coverage
```

#### Coverage: HTML

```bash
npm run coverage:html
```

## 📦 Protobuf

#### Usage

1. Create a `.proto` file in the `proto` directory.

> `proto/user.proto`

```protobuf
message GetUserByIdResponse {
  string _id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
  bool isEmailVerified = 5;
  google.protobuf.Timestamp createdAt = 6;
  google.protobuf.Timestamp updatedAt = 7;
}
```

2. In the route, set the `protobufType` in the `config` object.

```typescript
routeOptions.get<{
  Params: UserInterface.IGetUserByIdParams;
}>(
  "/users/:id",
  {
    schema: userSchema.getUserByIdSchema,
    preHandler: [verifyToken],
    config: {
      protobufType: "user.GetUserByIdResponse",
    },
  },
  userController.getUserById,
);
```

3. Download the definitions from `GET /proto`. This will return a `.zip` file containing all `.proto` files.

> [!IMPORTANT]
> To consume the Protobuf endpoints, the client **must** send the `Accept: application/x-protobuf` header and **must** have the corresponding `.proto` files to decode the response.

## 📄 API Documentation

The API documentation is available via Swagger UI.

```bash
http://localhost:3300/api/v1/docs
```

## 🔌 WebSocket

The API creates a WebSocket server using `fastify-websocket` and `amqplib` for message distribution.

#### Endpoints

- `/ws/test`: Public test endpoint.
- `/ws/register`: Restricted endpoint (requires `ADMIN` role).

#### How to test

These endpoints operate on the WebSocket protocol (`ws://`) and **cannot be accessed directly via a web browser's address bar**.

To test them, use a WebSocket client such as:

- **Insomnia**
- **Postman**
- **Hoppscotch**

**Example URL:** `ws://localhost:3300/api/v1/ws/test`

#### Usage

The application uses WebSockets to notify admins when a new user registers. This process involves **RabbitMQ** to distribute messages across multiple API instances (if applicable).

**Flow:**

1. **Service (`register.service.ts`)**: Publishes an event via `publishWS`.
2. **Plugin (`websocket.ts`)**: Sends the message to a RabbitMQ Fanout Exchange (`ws_register_exchange`).
3. **Controller (`register.controller.ts`)**: Subscribes to the exchange via `consumeWS` and forwards the message to connected WebSocket clients.

**Publisher (`src/services/auth/register.service.ts`):**

```typescript
await fastify.publishWS("register", {
  event: "register",
  message: fastify.i18n.t("message.auth.newUserRegistered", {
    email: user.email,
  }),
});
```

**Consumer (`src/controllers/ws/register.controller.ts`):**

```typescript
fastify.consumeWS("register", (data: IWSEvent) => {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
});
```

> [!TIP]
> See `src/controllers/ws/test.controller.ts` for a complete example of how to handle WebSocket connections and events.

## 🏗️ Architecture

The project follows a modular structure within the `src` directory:

- `assets`: Static files (images, etc).
- `config`: Configuration files (env, rate-limit, etc).
- `constants`: Global constants.
- `consumers`: RabbitMQ consumers.
- `controllers`: Request handlers.
- `db`: Database connection (Mongoose).
- `enums`: TypeScript enums.
- `handlers`: Specialized handlers (e.g. ErrorHandler).
- `helpers`: Utility functions.
- `hooks`: Fastify hooks (preSerialization, etc).
- `interfaces`: TypeScript interfaces.
- `locales`: i18n translation files.
- `models`: Mongoose models.
- `plugins`: Fastify plugins (RabbitMQ, Redis, etc).
- `repositories`: Data access layer.
- `routes`: API route definitions.
- `schemas`: Zod schemas for validation.
- `seeds`: Database seeding scripts.
- `services`: Business logic.
- `types`: Custom TypeScript types.

## 📝 Logging

Logging is handled by `pino` with **multistream** support:

- **Console**: Logs are output to `stdout` in JSON format.
- **File**: Logs are simultaneously saved to files in the `logs/` directory.
- **Log Rotation**: Logs are rotated automatically based on size and number of files (configured in `constants.ts`).

### Usage

The `fastify` logger instance is available in the request object:

```typescript
// Info level
request.log.info("User logged in successfully");

// Error level with object
request.log.error({ err }, "An error occurred while processing payment");

// Debug level
request.log.debug({ userId: user._id }, "Fetching user data");
```

## 🔐 Authentication

Authentication is handled via **JWT (JSON Web Tokens)** and **Secure Cookies**.

#### Constants

The token expiration times are configured in `src/constants/constants.ts`:

- **ACCESS_TOKEN_EXPIRES**: 15 minutes
- **REFRESH_TOKEN_EXPIRES**: 7 days
- **EMAIL_VERIFICATION_TOKEN_EXPIRES**: 1 day

#### Flow

1.  **Registration**:
    - User registers via `/api/v1/auth/register`.
    - API creates a user with `isVerified: false`.
    - API generates a **Email Verification Token**.
    - API sends an email (via RabbitMQ -> Worker -> Nodemailer) containing a verification link.
    - API publishes a WebSocket event (`register`) to notify admins.

2.  **Verification**:
    - User clicks the link in the email (`/verify-email?token=...`).
    - API validates the token and marks the user as `isVerified: true`.

3.  **Login**:
    - User authenticates via `/api/v1/auth/login`.
    - API issues two tokens as **HTTP-only Cookies**:
      - **Access Token**: Short-lived cookie.
      - **Refresh Token**: Long-lived, secure cookie.
    - _Note:_ The tokens are automatically sent by the browser in subsequent requests via cookies, not headers.

4.  **Token Refresh**:
    - When the Access Token expires (handled automatically by the browser/client logic), the client calls `/api/v1/auth/refresh-token`.
    - API validates the Refresh Token from the cookie and updates the cookies with new tokens.

The `verifyToken` preHandler protects routes requiring authentication, while `verifyRoles` handles authorization.

#### Frontend Integration

Since tokens are HttpOnly cookies, the frontend cannot read them. To ensure the browser sends them with requests:

**Fetch API**:

```javascript
fetch("api_url", { credentials: "include" });
```

**Axios**:

```javascript
axios.get("api_url", { withCredentials: true });
```

#### Refresh Token Logic (Frontend)

To handle token expiration automatically, implement an **interceptor** in your HTTP client:

1. **Request**: `GET /api/v1/resource`
2. **Error**: API returns `401 Unauthorized`.
3. **Action**: Call `GET /api/v1/auth/refresh-token` (sending `refreshToken` cookie).
4. **Retry**: If successful, retry the original request (`GET /api/v1/resource`).

_This ensures a seamless user experience without forcing repeated logins._

## 🔗 External Services

- **Grafana**: `http://localhost:3000` (Visualization)
- **RabbitMQ**: `http://localhost:15672` (Message Broker Management)
- **Prometheus**: Metrics collection (exposed for Grafana).

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git switch -c feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📜 License

This project is licensed under the GPL3.0 License - see the [LICENSE](LICENSE.txt) file for details.

<!-- Stargazers generated automatically with npx @titenq/stargazers -->
## ⭐ Stargazers

This repository has no stargazers yet. Be the first!
