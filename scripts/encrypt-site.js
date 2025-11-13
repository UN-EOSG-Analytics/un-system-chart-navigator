const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const password = process.env.SITE_PASSWORD;
const outDir = './out';

if (!password) {
  console.error('SITE_PASSWORD environment variable is required');
  process.exit(1);
}

function encryptHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      encryptHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      console.log(`Encrypting ${filePath}...`);
      // Using default sessionStorage (no --remember flag)
      // -f flag uses custom template
      // Password must come right after the file path, before other flags
      execSync(`npx staticrypt "${filePath}" "${password}" -f ./scripts/password-template.html --short -o "${filePath}"`, {
        stdio: 'pipe' // Don't inherit stdio to prevent interactive prompts
      });
    }
  });
}

console.log('Starting encryption of HTML files...');
encryptHtmlFiles(outDir);
console.log('Encryption complete!');
