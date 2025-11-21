"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
function installDependencies(service) {
    const servicePath = path_1.default.join(__dirname, service);
    const packageJsonPath = path_1.default.join(servicePath, "package.json");
    if (fs_1.default.existsSync(packageJsonPath)) {
        console.log(`📦 Installing dependencies for ${service}...`);
        (0, child_process_1.execSync)("npm install", { cwd: servicePath, stdio: "inherit" });
    }
    else {
        console.warn(`⚠️  Skipping ${service}: No package.json found`);
    }
}
console.log("🔧 Installing root dependencies...");
(0, child_process_1.execSync)("npm install", { cwd: __dirname, stdio: "inherit" });
services.forEach(installDependencies);
console.log("✅ All dependencies installed.");
