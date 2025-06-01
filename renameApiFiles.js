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
    } else {
      callback(fullPath);
    }
  });
}

const apiDir = path.join(__dirname, 'api');

walk(apiDir, (filePath) => {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  // Only rename .js and .js.map files
  if (base.endsWith('.js') || base.endsWith('.js.map')) {
    const newBase = base.replace(/\+api/g, '').replace(/\+/g, '');
    if (base !== newBase) {
      const newPath = path.join(dir, newBase);
      fs.renameSync(filePath, newPath);
      console.log(`Renamed: ${filePath} -> ${newPath}`);
    }
  }
}); 