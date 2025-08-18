"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
require("./cronJob-services/lessonServiceJobs");
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
require("./shared/modelSync");
const syncDb_1 = require("./config/syncDb");
const services = [
    {
        name: "founders-list-service",
        path: "/api/v1/waiting-list",
        port: 3002,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./waiting-list-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../waiting-list-service/dist/app.js"),
        },
    },
    {
        name: "notification-service",
        path: "/api/v1/notification",
        port: 3003,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./notification-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../notification-service/dist/app.js"),
        },
    },
    {
        name: "users-service",
        path: "/api/v1/users",
        port: 3004,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./user-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../user-service/dist/app.js"),
        },
    },
    {
        name: "lesson-service",
        path: "/api/v1/lessons",
        port: 3005,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./lesson-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../lesson-service/dist/app.js"),
        },
    },
    {
        name: "ededun-service",
        path: "/api/v1/ededun",
        port: 3006,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./ededun-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../ededun-service/dist/app.js"),
        },
    },
    {
        name: "pronunciation-feedback-service",
        path: "/api/v1/pronunciation",
        port: 3007,
        entryPoint: {
            dev: path_1.default.resolve(__dirname, "./pronunciation-feedback-service/src/app.ts"),
            prod: path_1.default.resolve(__dirname, "../pronunciation-feedback-service/dist/app.js"),
        },
    },
];
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
const MAIN_PORT = process_1.default.env.MAIN_PORT || 3010;
const NODE_ENV = process_1.default.env.NODE_ENV || "development";
const serviceProcesses = new Map();
const restartAttempts = new Map();
const failedServices = new Set();
let server;
function logServiceStatus() {
    const running = [...serviceProcesses.keys()];
    const failed = [...failedServices];
    console.log("\n======= 📊 SERVICE STATUS =======");
    console.log(`✅ Running services: ${running.length ? running.join(", ") : "None"}`);
    console.log(`❌ Failed services: ${failed.length ? failed.join(", ") : "None"}`);
    console.log("=================================\n");
}
function startSingleService(service) {
    return new Promise((resolve) => {
        const attempts = restartAttempts.get(service.name) || 0;
        if (attempts >= 5) {
            console.error(`❌ ${service.name} has failed too many times. Not restarting.`);
            failedServices.add(service.name);
            return resolve();
        }
        console.log(`Starting ${service.name} on port ${service.port}...`);
        const entryPoint = NODE_ENV === "production"
            ? service.entryPoint.prod
            : service.entryPoint.dev;
        const isTypeScript = entryPoint.endsWith(".ts");
        let command;
        let args;
        if (NODE_ENV === "production" || !isTypeScript) {
            command = "node";
            args = [entryPoint];
        }
        else {
            command = "node";
            args = ["-r", "ts-node/register", entryPoint];
        }
        const childProcess = (0, child_process_1.spawn)(command, args, {
            env: {
                ...process_1.default.env,
                PORT: service.port.toString(),
                SERVICE_NAME: service.name,
            },
            stdio: "inherit",
            shell: true,
        });
        serviceProcesses.set(service.name, childProcess);
        childProcess.on("error", (error) => {
            console.error(`Failed to start ${service.name}:`, error);
            resolve();
        });
        childProcess.on("exit", (code, signal) => {
            console.log(`${service.name} exited with code ${code} and signal ${signal}`);
            serviceProcesses.delete(service.name);
            if (code !== 0 && signal !== "SIGTERM") {
                const newAttempts = attempts + 1;
                restartAttempts.set(service.name, newAttempts);
                console.log(`Restarting ${service.name} in 5 seconds... (attempt ${newAttempts})`);
                setTimeout(() => startSingleService(service), 5000);
            }
            resolve();
        });
        setTimeout(() => {
            if (!failedServices.has(service.name)) {
                resolve();
            }
        }, 3000);
    });
}
async function startServices() {
    for (const service of services) {
        await startSingleService(service);
    }
    console.log("\n🎯 All services attempted startup. Final status:");
    logServiceStatus();
}
services.forEach((service) => {
    const proxyOptions = {
        target: `http://localhost:${service.port}`,
        pathRewrite: {
            [`^${service.path}`]: "/",
        },
        changeOrigin: true,
        logLevel: "warn",
    };
    app.use(service.path, (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions));
});
app.get("/health", (req, res) => {
    const servicesStatus = services.map((service) => {
        return {
            name: service.name,
            running: serviceProcesses.has(service.name),
        };
    });
    res.json({
        status: "ok",
        uptime: process_1.default.uptime(),
        services: servicesStatus,
        environment: NODE_ENV,
    });
});
app.get("/", (req, res) => {
    res.send(`
    <h1>Zabbot Backend Gateway</h1>
    <p>Environment: ${NODE_ENV}</p>
    <p>Available services:</p>
    <ul>
      ${services
        .map((service) => `<li><a href="${service.path}">${service.name}</a></li>`)
        .join("")}
    </ul>
    <p><a href="/health">Check Health Status</a></p>
  `);
});
function shutdown(code = 0) {
    console.log("🔻 Shutting down all services...");
    if (server) {
        server.close(() => {
            console.log("✅ HTTP server closed. Stopping microservices...");
        });
    }
    serviceProcesses.forEach((process, serviceName) => {
        console.log(`Stopping ${serviceName}...`);
        process.kill("SIGTERM");
        setTimeout(() => {
            if (!process.killed) {
                console.log(`Force killing ${serviceName} with SIGKILL`);
                process.kill("SIGKILL");
            }
        }, 1000);
    });
    setTimeout(() => {
        console.log("✅ Main server shutdown complete");
        process_1.default.exit(code);
    }, 3000);
}
process_1.default.on("SIGTERM", () => shutdown(0));
process_1.default.on("SIGINT", () => shutdown(0));
async function init() {
    await startServices();
    await (0, syncDb_1.syncDatabases)();
}
init();
app.use((req, res, next) => {
    const error = new Error(`Not Found: ${req.originalUrl}`);
    error.status = 404;
    next(error);
});
app.use((err, req, res, next) => {
    console.error("Express error:", err);
    res.status(err.status || 500).json({
        message: err.message,
        error: NODE_ENV === "development" ? err : {},
    });
});
server = http_1.default.createServer(app);
server.on("error", (error) => {
    console.error("💥 HTTP SERVER ERROR:", error);
    shutdown(1);
});
server.listen(MAIN_PORT, () => {
    console.log(`Main server listening on port ${MAIN_PORT}`);
    console.log(`Running in ${NODE_ENV} mode`);
    console.log(`Access your services at http://localhost:${MAIN_PORT}`);
});
