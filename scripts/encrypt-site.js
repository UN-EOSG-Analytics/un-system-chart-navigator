const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const password = process.env.STATICRYPT_PASSWORD;
const outDir = './out';

if (!password) {
  console.error('STATICRYPT_PASSWORD environment variable is required');
  process.exit(1);
}

console.log('Starting encryption of HTML files...');

// Encrypt all HTML files recursively, output to 'encrypted' directory
// Use -t instead of -f for template flag
execSync(
  `npx staticrypt out -r -d encrypted -t ./scripts/password-template.html --short`,
  {
    stdio: 'inherit'
  }
);

// Copy encrypted files back to out/ directory
function copyEncryptedFiles(encryptedDir, targetDir) {
  const items = fs.readdirSync(encryptedDir);
  
  items.forEach(item => {
    const encryptedPath = path.join(encryptedDir, item);
    const targetPath = path.join(targetDir, item);
    const stat = fs.statSync(encryptedPath);
    
    if (stat.isDirectory()) {
      copyEncryptedFiles(encryptedPath, targetPath);
    } else if (item.endsWith('.html')) {
      fs.copyFileSync(encryptedPath, targetPath);
      console.log(`Copied encrypted ${targetPath}`);
    }
  });
}

copyEncryptedFiles('./encrypted/out', './out');

// Clean up encrypted directory
fs.rmSync('./encrypted', { recursive: true });

console.log('Encryption complete!');
