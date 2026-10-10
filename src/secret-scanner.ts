import * as fs from 'fs';
import { Violation } from './ast-sentinel';

export function scanSecrets(files: string[], patterns: string[]): Violation[] {
  const violations: Violation[] = [];
  const regexes = patterns.map(p => new RegExp(p));

  for (const filePath of files) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const lines = code.split('\n');

    lines.forEach((lineText, index) => {
      for (const regex of regexes) {
        if (regex.test(lineText)) {
          violations.push({
            filePath,
            ruleId: 'hardcoded-secret',
            message: 'Hardcoded secret, API key, or JWT token detected in source code.',
            snippet: lineText.trim(),
            line: index + 1
          });
        }
      }
    });
  }

  return violations;
}
