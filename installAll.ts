import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const services = [
  "./shared",
  "./config",
  "./waiting-list-service",
  "./notification-service",
  "./user-service",
  "./lesson-service",
  "./ededun-service",
  "./pronunciation-feedback-service",
  "./payment-service",
];

function installDependencies(service: string) {
  const servicePath = path.join(__dirname, service);
  const packageJsonPath = path.join(servicePath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    console.log(`📦 Installing dependencies for ${service}...`);
    execSync("npm install", { cwd: servicePath, stdio: "inherit" });
  } else {
    console.warn(`⚠️  Skipping ${service}: No package.json found`);
  }
}

console.log("🔧 Installing root dependencies...");
execSync("npm install", { cwd: __dirname, stdio: "inherit" });

services.forEach(installDependencies);

console.log("✅ All dependencies installed.");
