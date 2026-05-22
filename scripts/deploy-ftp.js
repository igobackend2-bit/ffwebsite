/**
 * Manual FTP deploy script — uploads out/ to Hostinger public_html/
 *
 * Usage:
 *   node scripts/deploy-ftp.js
 *
 * Requires environment variables (add to .env.local):
 *   FTP_SERVER=ftp.famersfactory.com   (from Hostinger hPanel → FTP Accounts)
 *   FTP_USER=your-ftp-username
 *   FTP_PASS=your-ftp-password
 *   FTP_DIR=/public_html              (destination on server)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env.local if present
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
}

const { FTP_SERVER, FTP_USER, FTP_PASS, FTP_DIR = '/public_html' } = process.env;

if (!FTP_SERVER || !FTP_USER || !FTP_PASS) {
  console.error(`
ERROR: FTP credentials not set.
Add these to your .env.local file:

  FTP_SERVER=ftp.famersfactory.com
  FTP_USER=your-ftp-username
  FTP_PASS=your-ftp-password
  FTP_DIR=/public_html

FTP credentials are found in Hostinger hPanel → Hosting → FTP Accounts.
  `);
  process.exit(1);
}

const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  console.error('ERROR: out/ folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Install ftp-deploy if not present
try {
  require.resolve('ftp-deploy');
} catch {
  console.log('Installing ftp-deploy package...');
  execSync('npm install --save-dev ftp-deploy', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
  user: FTP_USER,
  password: FTP_PASS,
  host: FTP_SERVER,
  port: 21,
  localRoot: outDir,
  remoteRoot: FTP_DIR,
  include: ['*', '**/*', '.*'],   // include hidden files like .htaccess
  exclude: ['.git', '.git/**'],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log(`\nDeploying out/ → ${FTP_SERVER}${FTP_DIR}\n`);

ftpDeploy
  .deploy(config)
  .then((res) => {
    console.log(`\n✅ Deployed ${res.length} files successfully!`);
    console.log(`🌐 Visit: https://famersfactory.com`);
  })
  .catch((err) => {
    console.error('\n❌ Deploy failed:', err);
    process.exit(1);
  });

ftpDeploy.on('uploading', (data) => {
  process.stdout.write(`\r  Uploading ${data.filename} (${data.percentComplete}%)    `);
});
