import * as fs from 'fs';
import * as path from 'path';

export function installPreCommitHook() {
  const gitDir = path.resolve(process.cwd(), '.git');
  if (!fs.existsSync(gitDir)) {
    console.error("[TAPIS ERROR] .git directory not found. Initialize git repository first.");
    process.exit(1);
  }

  const hookDir = path.join(gitDir, 'hooks');
  if (!fs.existsSync(hookDir)) {
    fs.mkdirSync(hookDir);
  }

  const hookPath = path.join(hookDir, 'pre-commit');
  const hookScript = `#!/bin/sh\n# Tapis Pre-Commit Interceptor\nnpx tapis check\n`;
  
  fs.writeFileSync(hookPath, hookScript);
  fs.chmodSync(hookPath, '755');
  console.log("[TAPIS SUCCESS] Git pre-commit hook installed successfully at .git/hooks/pre-commit");
}
