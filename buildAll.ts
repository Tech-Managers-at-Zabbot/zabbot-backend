import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

// Build order is important - shared must be built first
const services = [
  {name: 'config', path: './config'},
  { name: 'shared', path: './shared' },
  { name: 'founding-list-service', path: './waiting-list-service' },
  { name: 'notification-service', path: './notification-service' },
  { name: 'root', path: './' }
];

// Create build function with more detailed output
function buildService(service: { name: string; path: string }) {
  const servicePath = path.join(__dirname, service.path);
  const packageJson = path.join(servicePath, 'package.json');

  if (fs.existsSync(packageJson)) {
    try {
      console.log(`\n🏗️  Building ${service.name}...`);
      
      // If it's the root project, use the local build script
      if (service.name === 'root') {
        execSync('npm run build', { stdio: 'inherit' });
      } else {
        execSync('npm run build', { cwd: servicePath, stdio: 'inherit' });
      }
      
      console.log(`✅ Successfully built ${service.name}`);


    } catch (error: any) {
      console.error(`❌ Failed to build ${service.name}:`, error.message);
      // Exit with error code if a build fails
      process.exit(1);
    }finally {
        console.log('Copying shared utilities to services...');
    fs.copySync('shared/dist', 'shared');
    }
  } else {
    console.warn(`⚠️  Skipping ${service.name}: No package.json found at ${packageJson}`);
  }
}

console.log('🚀 Starting build process...');

// Build services in sequence (important for TypeScript project references)
for (const service of services) {
  buildService(service);
}

console.log('\n✨ All services built successfully!');