import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const services = ['./shared', './waiting-list-service', './notification-service'];

// Build root first
console.log(`\n🏗️  Building root project...`);
execSync('npm run build', { stdio: 'inherit' });

services.forEach(service => {
  const servicePath = path.join(__dirname, service);
  const packageJson = path.join(servicePath, 'package.json');

  if (fs.existsSync(packageJson)) {
    try {
      console.log(`\n🏗️  Building ${service}...`);
      execSync('npm run build', { cwd: servicePath, stdio: 'inherit' });
    } catch (error: any) {
      console.error(`❌ Failed to build ${service}:`, error.message);
    }
  } else {
    console.warn(`⚠️  Skipping ${service}: No package.json found`);
  }
});