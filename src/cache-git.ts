import { execSync } from 'child_process';
import * as fs from 'fs';

const CACHE_FILE = '.tapiscache';

interface CacheData {
  [filePath: string]: number; // Menyimpan timestamp modifikasi (mtime)
}

/**
 * Mendapatkan daftar file yang sedang di-staged di Git
 */
export function getStagedFiles(): string[] {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
    });
    return output.split('\n').filter(Boolean);
  } catch (e) {
    // Fallback jika bukan repo git, kembalikan array kosong
    return [];
  }
}

/**
 * Memuat cache lokal
 */
export function loadCache(): CacheData {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Menyimpan cache lokal
 */
export function saveCache(cache: CacheData) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Menyaring file yang benar-benar berubah sejak pemeriksaan terakhir
 */
export function filterUnchangedFiles(files: string[]): string[] {
  const cache = loadCache();
  const newCache: CacheData = {};
  const changedFiles: string[] = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const stats = fs.statSync(file);
    const mtime = stats.mtimeMs;
    newCache[file] = mtime;

    // Jika file belum ada di cache atau waktu modifikasinya berbeda, masukkan ke daftar cek
    if (cache[file] !== mtime) {
      changedFiles.push(file);
    }
  }

  saveCache(newCache);
  return changedFiles;
}
