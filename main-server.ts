import express from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import cors from 'cors';
import logger from "morgan";

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
    name: 'waiting-list-service',
    path: '/api/waiting-list',
    port: 3001,
    entryPoint: './dist/app.js'  // Assuming compiled JavaScript is in dist folder
  },
  // Add other services as they become available
  // Example:
  // {
  //   name: 'user-service',
  //   path: '/users',
  //   port: 3002,
  //   entryPoint: './dist/app.js'
  // },
];

// Create main Express app
const app = express();

app.use(cors());
app.use(logger("dev")); 

const MAIN_PORT = 3010;

// Map to store child processes
const serviceProcesses: Map<string, ChildProcess> = new Map();

// Start all microservices
function startServices() {
  services.forEach(service => {
    console.log(`Starting ${service.name} on port ${service.port}...`);
    
    const serviceDir = path.join(__dirname, service.name);
    const childProcess = spawn('node', [service.entryPoint], {
      cwd: serviceDir,
      env: {
        ...process.env,
        PORT: service.port.toString(),
        SERVICE_NAME: service.name
      },
      stdio: 'inherit'
    });
    
    serviceProcesses.set(service.name, childProcess);
    
    childProcess.on('error', (error) => {
      console.error(`Failed to start ${service.name}:`, error);
    });
    
    childProcess.on('exit', (code, signal) => {
      console.log(`${service.name} exited with code ${code} and signal ${signal}`);
      serviceProcesses.delete(service.name);
      
      // Optional: Restart the service if it crashes
      if (code !== 0 && signal !== 'SIGTERM') {
        console.log(`Restarting ${service.name}...`);
        setTimeout(() => startServices(), 5000);
      }
    });
  });
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

function shutdown() {
  console.log('Shutting down all services...');
  
  // Send termination signal to all child processes
  serviceProcesses.forEach((process, serviceName) => {
    console.log(`Stopping ${serviceName}...`);
    process.kill('SIGTERM');
  });
  
  // Give processes a chance to clean up
  setTimeout(() => {
    console.log('Main server shutting down');
    process.exit(0);
  }, 3000);
}

// Start all services and then the main server
startServices();

app.listen(MAIN_PORT, () => {
  console.log(`Main server listening on port ${MAIN_PORT}`);
  console.log(`Access your services at http://localhost:${MAIN_PORT}`);
});