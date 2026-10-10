import * as ts from 'typescript';
import * as fs from 'fs';
import { BoundaryRule } from './config';

export interface Violation {
  filePath: string;
  ruleId: string;
  message: string;
  snippet: string;
  line: number;
}

function matchGlob(filePath: string, pattern: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  const regexString = normalizedPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');

  const regex = new RegExp(`^${regexString}$`);
  return regex.test(normalizedPath);
}

function extractTypeScriptFromVue(vueContent: string): string {
  const scriptMatch = vueContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return scriptMatch ? scriptMatch[1] : '';
}

export function checkAstBoundaries(files: string[], rules: BoundaryRule[]): Violation[] {
  const violations: Violation[] = [];

  for (const filePath of files) {
    let code = fs.readFileSync(filePath, 'utf-8');
    let virtualFilePath = filePath;

    if (filePath.endsWith('.vue')) {
      code = extractTypeScriptFromVue(code);
      virtualFilePath = filePath + '.ts';
    }

    const sourceFile = ts.createSourceFile(
      virtualFilePath,
      code,
      ts.ScriptTarget.Latest,
      true
    );

    ts.forEachChild(sourceFile, function visit(node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        const importModule = (node.moduleSpecifier as ts.StringLiteral).text;
        
        for (const rule of rules) {
          if (matchGlob(filePath, rule.target) && rule.forbiddenImports.includes(importModule)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            const lines = code.split('\n');
            violations.push({
              filePath,
              ruleId: rule.ruleId,
              message: rule.message,
              snippet: lines[line]?.trim() || '',
              line: line + 1
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  return violations;
}
