#!/usr/bin/env node

// Deployment Health Check Script
const https = require('https');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function checkUrl(url, name) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`${colors.green}✅ ${name}: ${url} - Status: ${res.statusCode}${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.yellow}⚠️  ${name}: ${url} - Status: ${res.statusCode}${colors.reset}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`${colors.red}❌ ${name}: ${url} - Error: ${err.message}${colors.reset}`);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.log(`${colors.red}❌ ${name}: ${url} - Timeout${colors.reset}`);
      req.destroy();
      resolve(false);
    });
  });
}

async function checkDeployment() {
  console.log(`${colors.blue}🔍 Checking deployment health...${colors.reset}\n`);

  // Get URLs from command line arguments or use defaults
  const frontendUrl = process.argv[2] || 'http://localhost:5174';
  const backendUrl = process.argv[3] || 'http://localhost:5001';

  const results = await Promise.all([
    checkUrl(frontendUrl, 'Frontend'),
    checkUrl(`${backendUrl}/api/health`, 'Backend Health'),
    checkUrl(`${backendUrl}/api/potd`, 'POTD API')
  ]);

  const allHealthy = results.every(result => result);

  console.log('\n' + '='.repeat(50));
  if (allHealthy) {
    console.log(`${colors.green}🎉 All services are healthy!${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  Some services need attention${colors.reset}`);
  }
  console.log('='.repeat(50));

  console.log(`\n${colors.blue}📋 Usage:${colors.reset}`);
  console.log(`node check-deployment.js [frontend-url] [backend-url]`);
  console.log(`\n${colors.blue}Example:${colors.reset}`);
  console.log(`node check-deployment.js https://your-app.vercel.app https://your-api.railway.app`);
}

checkDeployment();
