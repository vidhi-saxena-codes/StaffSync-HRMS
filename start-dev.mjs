import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   Starting StaffSync Full-Stack HRMS System');
console.log('\x1b[36m%s\x1b[0m', '   Backend (Express + MongoDB) & Frontend (Vite)');
console.log('\x1b[36m%s\x1b[0m', '================================================\n');

// 1. Start Backend Server
const backend = spawn('npx', ['tsx', 'server.ts'], {
  cwd: path.resolve(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: process.env.PORT || '5000' },
});

// 2. Start Frontend Dev Server
const frontend = spawn('npx', ['vite'], {
  cwd: path.resolve(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

const cleanup = () => {
  console.log('\nShutting down StaffSync servers...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

