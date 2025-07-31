"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const services = [
    { name: 'config', path: './config' },
    { name: 'shared', path: './shared' },
    { name: 'founding-list-service', path: './waiting-list-service' },
    { name: 'notification-service', path: './notification-service' },
    { name: 'user-service', path: './user-service' },
    { name: 'ededun-service', path: './ededun-service' },
    { name: 'lesson-service', path: './lesson-service' },
    { name: 'root', path: './' }
];
function buildService(service) {
    const servicePath = path_1.default.join(__dirname, service.path);
    const packageJson = path_1.default.join(servicePath, 'package.json');
    if (fs_extra_1.default.existsSync(packageJson)) {
        try {
            console.log(`\n🏗️  Building ${service.name}...`);
            if (service.name === 'root') {
                (0, child_process_1.execSync)('npm run build', { stdio: 'inherit' });
            }
            else {
                (0, child_process_1.execSync)('npm run build', { cwd: servicePath, stdio: 'inherit' });
            }
            console.log(`✅ Successfully built ${service.name}`);
        }
        catch (error) {
            console.error(`❌ Failed to build ${service.name}:`, error.message);
            process.exit(1);
        }
        finally {
            console.log('Copying shared utilities to services...');
            fs_extra_1.default.copySync('shared/dist', 'shared');
        }
    }
    else {
        console.warn(`⚠️  Skipping ${service.name}: No package.json found at ${packageJson}`);
    }
}
console.log('🚀 Starting build process...');
for (const service of services) {
    buildService(service);
}
console.log('\n✨ All services built successfully!');
