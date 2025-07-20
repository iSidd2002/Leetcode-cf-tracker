#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running comprehensive test suite...\n');

async function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`📍 Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function runTests() {
  try {
    console.log('🔧 Installing dependencies...');
    await runCommand('npm', ['install']);
    await runCommand('npm', ['install'], path.join(process.cwd(), 'server'));

    console.log('\n🧪 Running backend tests...');
    await runCommand('npm', ['run', 'test:coverage'], path.join(process.cwd(), 'server'));

    console.log('\n🧪 Running frontend tests...');
    await runCommand('npm', ['run', 'test:coverage']);

    console.log('\n✅ All tests passed successfully!');
    console.log('\n📊 Test Coverage Reports:');
    console.log('  - Backend: ./server/coverage/lcov-report/index.html');
    console.log('  - Frontend: ./coverage/index.html');

  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node test-runner.js [options]

Options:
  --help, -h     Show this help message
  --backend      Run only backend tests
  --frontend     Run only frontend tests
  --watch        Run tests in watch mode
  --coverage     Generate coverage reports (default)

Examples:
  node test-runner.js                 # Run all tests with coverage
  node test-runner.js --backend       # Run only backend tests
  node test-runner.js --frontend      # Run only frontend tests
  node test-runner.js --watch         # Run tests in watch mode
`);
  process.exit(0);
}

if (args.includes('--backend')) {
  runCommand('npm', ['run', 'test:coverage'], path.join(process.cwd(), 'server'))
    .then(() => console.log('✅ Backend tests completed'))
    .catch(error => {
      console.error('❌ Backend tests failed:', error.message);
      process.exit(1);
    });
} else if (args.includes('--frontend')) {
  runCommand('npm', ['run', 'test:coverage'])
    .then(() => console.log('✅ Frontend tests completed'))
    .catch(error => {
      console.error('❌ Frontend tests failed:', error.message);
      process.exit(1);
    });
} else if (args.includes('--watch')) {
  console.log('🔍 Running tests in watch mode...');
  console.log('Press Ctrl+C to exit\n');
  
  // Run both in parallel
  const backendWatch = spawn('npm', ['run', 'test:watch'], {
    cwd: path.join(process.cwd(), 'server'),
    stdio: 'inherit',
    shell: true
  });
  
  const frontendWatch = spawn('npm', ['run', 'test'], {
    stdio: 'inherit',
    shell: true
  });

  process.on('SIGINT', () => {
    backendWatch.kill();
    frontendWatch.kill();
    process.exit(0);
  });
} else {
  runTests();
}
