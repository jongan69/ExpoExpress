import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir, callback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      callback(fullPath);
    }
  });
}

const apiDir = path.join(__dirname, 'api');

const importExportRegex = /((import|export)[^'"]*from\s*['"])(\.\.?\/[^'"]+?)(['"])/g;

walk(apiDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let replaced = false;
  content = content.replace(importExportRegex, (match, p1, _p2, p3, p4) => {
    if (!p3.endsWith('.js') && !p3.endsWith('.json')) {
      replaced = true;
      return `${p1}${p3}.js${p4}`;
    }
    return match;
  });
  if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}); 