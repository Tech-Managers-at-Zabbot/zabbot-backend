import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const services = [
  { name: "config", path: "./config" },
  { name: "shared", path: "./shared" },
  { name: "user-service", path: "./user-service" },
  { name: "founding-list-service", path: "./waiting-list-service" },
  { name: "notification-service", path: "./notification-service" },
  { name: "ededun-service", path: "./ededun-service" },
  { name: "lesson-service", path: "./lesson-service" },
  {
    name: "pronunciation-feedback-service",
    path: "./pronunciation-feedback-service",
  },
  { name: "payment-service", path: "./payment-service" },
  { name: "root", path: "./" },
];

function buildService(service: { name: string; path: string }) {
  const servicePath = path.join(__dirname, service.path);
  const packageJson = path.join(servicePath, "package.json");

  if (fs.existsSync(packageJson)) {
    try {
      console.log(`\n🏗️  Building ${service.name}...`);

      if (service.name === "root") {
        execSync("npm run build", { stdio: "inherit" });
      } else {
        execSync("npm run build", { cwd: servicePath, stdio: "inherit" });
      }

      console.log(`✅ Successfully built ${service.name}`);

    } catch (error: any) {
      console.error(`❌ Failed to build ${service.name}:`, error.message);
      process.exit(1);
    }
    //   finally {
    //     console.log("📦 Copying shared utilities to shared folder...");
    //       fs.copySync("shared/dist", "shared");
    // }
  } else {
    console.warn(
      `⚠️  Skipping ${service.name}: No package.json found at ${packageJson}`
    );
  }
}

console.log("🚀 Starting build process...");

for (const service of services) {
  buildService(service);
}

console.log("\n✨ All services built successfully!");