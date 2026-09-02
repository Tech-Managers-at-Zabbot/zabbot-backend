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

const installEnv = {
  ...process.env,
  NPM_CONFIG_PRODUCTION: "false",
  NPM_CONFIG_OMIT: "",
};

function installDependencies(service: string) {
  const servicePath = path.join(__dirname, service);
  const packageJsonPath = path.join(servicePath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    console.log(`📦 Installing dependencies for ${service}...`);
    execSync("npm install --include=dev", {
      cwd: servicePath,
      stdio: "inherit",
      env: installEnv,
    });
  } else {
    console.warn(`⚠️  Skipping ${service}: No package.json found`);
  }
}

console.log("🔧 Installing root dependencies...");
execSync("npm install --include=dev", {
  cwd: __dirname,
  stdio: "inherit",
  env: installEnv,
});

services.forEach(installDependencies);

console.log("✅ All dependencies installed.");
