import process from "process";

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  shutdown(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED REJECTION:", reason);
  shutdown(1);
});

import "./cronJob-services/lessonServiceJobs";
import express from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import http from "http";
import "./config/models";
import { syncDatabases } from "./config/syncDb";
// import { associateUserModels } from './user-service/src/entities/associations';

// Configuration for services
interface ServiceConfig {
  name: string;
  path: string;
  port: number;
  entryPoint: {
    dev: string;
    prod: string;
  };
}
// List of all microservices
const services: ServiceConfig[] = [
  {
    name: "founders-list-service",
    path: "/api/v1/waiting-list",
    port: 3002,
    entryPoint: {
      dev: path.resolve(__dirname, "./waiting-list-service/src/app.ts"),
      prod: path.resolve(__dirname, "../waiting-list-service/dist/app.js"),
    },
  },
  {
    name: "notification-service",
    path: "/api/v1/notification",
    port: 3003,
    entryPoint: {
      dev: path.resolve(__dirname, "./notification-service/src/app.ts"),
      prod: path.resolve(__dirname, "../notification-service/dist/app.js"),
    },
  },
  {
    name: "users-service",
    path: "/api/v1/users",
    port: 3004,
    entryPoint: {
      dev: path.resolve(__dirname, "./user-service/src/app.ts"),
      prod: path.resolve(__dirname, "../user-service/dist/app.js"),
    },
  },
  {
    name: "lesson-service",
    path: "/api/v1/lessons",
    port: 3005,
    entryPoint: {
      dev: path.resolve(__dirname, "./lesson-service/src/app.ts"),
      prod: path.resolve(__dirname, "../lesson-service/dist/app.js"),
    },
  },
  {
    name: "ededun-service",
    path: "/api/v1/ededun",
    port: 3006,
    entryPoint: {
      dev: path.resolve(__dirname, "./ededun-service/src/app.ts"),
      prod: path.resolve(__dirname, "../ededun-service/dist/app.js"),
    },
  },
];

const app = express();

dotenv.config();

app.use(cors());
app.use(logger("dev"));

const MAIN_PORT = process.env.MAIN_PORT || 3010;
const NODE_ENV = process.env.NODE_ENV || "development";

// Map to store child processes
const serviceProcesses = new Map<string, ChildProcess>();
const restartAttempts = new Map<string, number>();
const failedServices = new Set<string>();
let server: http.Server; // Server reference for proper shutdown

function logServiceStatus() {
  const running = [...serviceProcesses.keys()];
  const failed = [...failedServices];

  console.log("\n======= 📊 SERVICE STATUS =======");
  console.log(
    `✅ Running services: ${running.length ? running.join(", ") : "None"}`
  );
  console.log(
    `❌ Failed services: ${failed.length ? failed.join(", ") : "None"}`
  );
  console.log("=================================\n");
}

function startSingleService(service: ServiceConfig) {
  const attempts = restartAttempts.get(service.name) || 0;

  if (attempts >= 5) {
    console.error(
      `❌ ${service.name} has failed too many times. Not restarting.`
    );
    failedServices.add(service.name);
    return;
  }

  console.log(`Starting ${service.name} on port ${service.port}...`);

  const entryPoint =
    NODE_ENV === "production"
      ? service.entryPoint.prod
      : service.entryPoint.dev;

  // Choose runner based on environment and file extension
  const isTypeScript = entryPoint.endsWith(".ts");
  let command: string;
  let args: string[];

  if (NODE_ENV === "production" || !isTypeScript) {
    // For production or JS files, use node
    command = "node";
    args = [entryPoint];
  } else {
    // For development with TS files, use ts-node
    // command = 'npx';
    // args = ['ts-node', entryPoint];
    command = "node";
    args = ["-r", "ts-node/register", entryPoint];
  }

  const childProcess = spawn(command, args, {
    env: {
      ...process.env,
      PORT: service.port.toString(),
      SERVICE_NAME: service.name,
    },
    stdio: "inherit",
    shell: true,
  });

  serviceProcesses.set(service.name, childProcess);

  childProcess.on("error", (error) => {
    console.error(`Failed to start ${service.name}:`, error);
  });

  childProcess.on("exit", (code, signal) => {
    console.log(
      `${service.name} exited with code ${code} and signal ${signal}`
    );
    serviceProcesses.delete(service.name);

    if (code !== 0 && signal !== "SIGTERM") {
      const newAttempts = attempts + 1;
      restartAttempts.set(service.name, newAttempts);
      console.log(
        `Restarting ${service.name} in 5 seconds... (attempt ${newAttempts})`
      );
      setTimeout(() => startSingleService(service), 5000);
    }
  });
}

function startServices() {
  services.forEach((service) => startSingleService(service));
  setTimeout(() => {
    console.log("\n🎯 All services attempted startup. Final status:");
    logServiceStatus();
  }, 7000);
}

// Proxy middleware for each service
services.forEach((service) => {
  const proxyOptions: Options = {
    target: `http://localhost:${service.port}`,
    pathRewrite: {
      [`^${service.path}`]: "/", // Remove the path prefix when forwarding
    },
    changeOrigin: true,
    // @ts-ignore - logLevel exists in runtime but not in type definitions
    logLevel: "warn",
  };

  app.use(service.path, createProxyMiddleware(proxyOptions));
});

// Health check endpoint
app.get("/health", (req, res) => {
  const servicesStatus = services.map((service) => {
    return {
      name: service.name,
      running: serviceProcesses.has(service.name),
    };
  });

  res.json({
    status: "ok",
    uptime: process.uptime(),
    services: servicesStatus,
    environment: NODE_ENV,
  });
});

// associateUserModels();

// Main app root
app.get("/", (req, res) => {
  res.send(`
    <h1>Zabbot Backend Gateway</h1>
    <p>Environment: ${NODE_ENV}</p>
    <p>Available services:</p>
    <ul>
      ${services
        .map(
          (service) => `<li><a href="${service.path}">${service.name}</a></li>`
        )
        .join("")}
    </ul>
    <p><a href="/health">Check Health Status</a></p>
  `);
});

// Graceful shutdown function
function shutdown(code = 0) {
  console.log("🔻 Shutting down all services...");

  // First close the HTTP server to stop accepting new connections
  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed. Stopping microservices...");
    });
  }

  // Terminate all child processes
  serviceProcesses.forEach((process, serviceName) => {
    console.log(`Stopping ${serviceName}...`);
    process.kill("SIGTERM");

    // Hard kill after timeout if process doesn't respond
    setTimeout(() => {
      if (!process.killed) {
        console.log(`Force killing ${serviceName} with SIGKILL`);
        process.kill("SIGKILL");
      }
    }, 1000);
  });

  // Exit the main process after a timeout
  setTimeout(() => {
    console.log("✅ Main server shutdown complete");
    process.exit(code);
  }, 3000);
}

// Error handlers for process signals
process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));

// Start all services
async function init() {
  await syncDatabases();
  startServices();
}

init();

// Error handlers for Express
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Express error:", err);
    res.status(err.status || 500).json({
      message: err.message,
      error: NODE_ENV === "development" ? err : {},
    });
  }
);

// HTTP server with error handling
server = http.createServer(app);

// Error handler for the HTTP server
server.on("error", (error) => {
  console.error("💥 HTTP SERVER ERROR:", error);
  shutdown(1);
});

// Start the server
server.listen(MAIN_PORT, () => {
  console.log(`Main server listening on port ${MAIN_PORT}`);
  console.log(`Running in ${NODE_ENV} mode`);
  console.log(`Access your services at http://localhost:${MAIN_PORT}`);
});
