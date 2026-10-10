import { spawnSync } from 'child_process';

/**
 * Menyalin teks prompt ke clipboard secara otomatis lintas platform
 */
export function copyToClipboard(text: string): boolean {
  const platform = process.platform;
  let cmd = '';
  let args: string[] = [];

  if (platform === 'darwin') {
    cmd = 'pbcopy';
  } else if (platform === 'win32') {
    cmd = 'clip';
  } else {
    // Linux (membutuhkan xclip atau xsel, jika tidak ada akan aman tanpa crash)
    cmd = 'xclip';
    args = ['-selection', 'clipboard'];
  }

  try {
    const result = spawnSync(cmd, args, { input: text, encoding: 'utf8' });
    return result.status === 0;
  } catch (e) {
    // Gagal menyalin secara diam-diam agar CLI tidak error
    return false;
  }
}
