import fs from 'fs';
import path from 'path';

export const storageDir = process.env.STORAGE_DIR || './uploads';

export function ensureStorageDir() {
  const full = path.resolve(storageDir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
  }
  return full;
}

ensureStorageDir();
