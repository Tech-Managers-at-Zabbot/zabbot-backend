process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err);
  shutdown(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  shutdown(1);
});

import express from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import cors from 'cors';
import logger from "morgan";
import dotenv from 'dotenv';

// Configuration for services
interface ServiceConfig {
  name: string;
  path: string;
  port: number;
  entryPoint: string; // Path to the service's entry point relative to service directory
}

// List of all microservices
const services: ServiceConfig[] = [
  {
    name: 'founders-list-service',
    path: '/api/waiting-list',
    port: 3002,
    entryPoint: path.resolve(__dirname, '../waiting-list-service/dist/src/app.js')
  },
  {
    name: 'notification-service',
    path: '/users',
    port: 3003,
    entryPoint: path.resolve(__dirname, '../notification-service/dist/src/app.js')
  }
];

// Create main Express app
const app = express();

dotenv.config()

app.use(cors());
app.use(logger("dev")); 

const MAIN_PORT = process.env.MAIN_PORT || 3010;

// Map to store child processes
const serviceProcesses = new Map<string, ChildProcess>();
const restartAttempts = new Map<string, number>();
const failedServices = new Set<string>();


function logServiceStatus() {
  const running = [...serviceProcesses.keys()];
  const failed = [...failedServices];

  console.log('\n======= 📊 SERVICE STATUS =======');
  console.log(`✅ Running services: ${running.length ? running.join(', ') : 'None'}`);
  console.log(`❌ Failed services: ${failed.length ? failed.join(', ') : 'None'}`);
  console.log('=================================\n');
}


function startSingleService(service: ServiceConfig) {
  const attempts = restartAttempts.get(service.name) || 0;

  if (attempts >= 5) {
     console.error(`❌ ${service.name} has failed too many times. Not restarting.`);
    failedServices.add(service.name);
    // logServiceStatus();
    return;
  }

  console.log(`Starting ${service.name} on port ${service.port}...`);
  const childProcess = spawn('node', [service.entryPoint], {
    env: { ...process.env, PORT: service.port.toString(), SERVICE_NAME: service.name },
    stdio: 'inherit',
  });

  serviceProcesses.set(service.name, childProcess);

  childProcess.on('error', (error) => {
    console.error(`Failed to start ${service.name}:`, error);
  });

  childProcess.on('exit', (code, signal) => {
    console.log(`${service.name} exited with code ${code} and signal ${signal}`);
    serviceProcesses.delete(service.name);

    if (code !== 0 && signal !== 'SIGTERM') {
      const newAttempts = attempts + 1;
      restartAttempts.set(service.name, newAttempts);
      console.log(`Restarting ${service.name} in 5 seconds... (attempt ${newAttempts})`);
      setTimeout(() => startSingleService(service), 5000);
    }
  });
}



function startServices() {
services.forEach(service => startSingleService(service));
 setTimeout(() => {
    console.log('\n🎯 All services attempted startup. Final status:');
    logServiceStatus();
  }, 7000);
}

// Set up proxy middleware for each service
services.forEach(service => {
  const proxyOptions: Options = {
    target: `http://localhost:${service.port}`,
    pathRewrite: {
      [`^${service.path}`]: '/' // Remove the path prefix when forwarding
    },
    changeOrigin: true,
    // @ts-ignore - logLevel exists in runtime but not in type definitions
    logLevel: 'warn'
  };
  
  app.use(service.path, createProxyMiddleware(proxyOptions));
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  const servicesStatus = services.map(service => {
    return {
      name: service.name,
      running: serviceProcesses.has(service.name)
    };
  });
  
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    services: servicesStatus
  });
});

// Main app root
app.get('/', (req, res) => {
  res.send(`
    <h1>Microservices Gateway</h1>
    <p>Available services:</p>
    <ul>
      ${services.map(service => `<li><a href="${service.path}">${service.name}</a></li>`).join('')}
    </ul>
    <p><a href="/health">Check Health Status</a></p>
  `);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);


function shutdown(code = 0) {
  console.log('🔻 Shutting down all services...');

  serviceProcesses.forEach((process, serviceName) => {
    console.log(`Stopping ${serviceName}...`);
    process.kill('SIGTERM');

    // Optional hard kill after timeout
    setTimeout(() => {
      if (!process.killed) process.kill('SIGKILL');
    }, 1000);
  });

  setTimeout(() => {
    console.log('✅ Main server shutdown complete');
    process.exit(code);
  }, 3000);
}

// Start all services and then the main server
startServices();

// Error handlers
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
});

// app.use(errorUtilities.globalErrorHandler);

app.listen(MAIN_PORT, () => {
  console.log(`Main server listening on port ${MAIN_PORT}`);
  console.log(`Access your services at http://localhost:${MAIN_PORT}`);
});