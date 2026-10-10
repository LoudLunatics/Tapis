import * as fs from 'fs';
import * as path from 'path';
import { Violation } from './ast-sentinel';

export function checkAiContextFiles(requiredFiles: string[]): Violation[] {
  const violations: Violation[] = [];
  const rootDir = process.cwd();

  for (const fileName of requiredFiles) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) {
      violations.push({
        filePath: fileName,
        ruleId: 'missing-ai-context',
        message: `Essential AI context file '${fileName}' is missing from the project root. AI assistants need this file to understand architectural rules.`,
        snippet: `Create a '${fileName}' file in the root directory.`,
        line: 0
      });
    }
  }

  return violations;
}
