import * as ts from 'typescript';

export interface LintIssue {
  filePath: string;
  line: number;
  snippet: string;
  message: string;
}

/**
 * Memindai file TypeScript/JavaScript untuk mencari sisa debugging
 */
export function lintCode(filePath: string, sourceText: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  function visitor(node: ts.Node) {
    // 1. Deteksi pernyataan 'debugger;'
    if (node.kind === ts.SyntaxKind.DebuggerStatement) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      issues.push({
        filePath,
        line: line + 1,
        snippet: 'debugger;',
        message: 'Leftover debugger statement found in production code.',
      });
    }

    // 2. Deteksi pemanggilan 'console.*' (console.log, console.debug, dll)
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr)) {
        if (
          ts.isIdentifier(expr.expression) &&
          expr.expression.text === 'console'
        ) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          issues.push({
            filePath,
            line: line + 1,
            snippet: node.getText(sourceFile),
            message: `Leftover ${expr.name.text} statement found.`,
          });
        }
      }
    }

    ts.forEachChild(node, visitor);
  }

  visitor(sourceFile);
  return issues;
}
