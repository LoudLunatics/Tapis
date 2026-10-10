#!/usr/bin/env node

import { loadConfig } from './config';
import { checkAstBoundaries } from './ast-sentinel';
import { scanSecrets } from './secret-scanner';
import { checkAiContextFiles } from './ai-context-checker';
import { generateAiPrompt } from './prompt-generator';
import { installPreCommitHook } from './git-interceptor';
import { getStagedFiles, filterUnchangedFiles } from './cache-git';
import { copyToClipboard } from './clipboard';
import { lintCode } from './ast-linter';
import * as fs from 'fs';

const args = process.argv.slice(2);
const command = args[0];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist')) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (
        filePath.endsWith('.ts') || 
        filePath.endsWith('.tsx') || 
        filePath.endsWith('.js') || 
        filePath.endsWith('.jsx') || 
        filePath.endsWith('.vue')
      ) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

if (command === 'init-hook') {
  installPreCommitHook();
} else if (command === 'check' || !command) {
  try {
    const config = loadConfig();
    
    // Optimalisasi kinerja untuk laptop kentang: gunakan git diff & incremental cache
    const stagedFiles = getStagedFiles();
    const filesToScan = stagedFiles.length > 0 ? filterUnchangedFiles(stagedFiles) : getAllFiles('src');

    if (filesToScan.length === 0) {
      console.log("[TAPIS] Tidak ada perubahan file baru yang perlu diperiksa. Selesai.");
      process.exit(0);
    }

    const astViolations = checkAstBoundaries(filesToScan, config.boundaries);
    const secretViolations = config.secretScanning.enabled 
      ? scanSecrets(filesToScan, config.secretScanning.patterns) 
      : [];
    const contextViolations = (config.aiContextFiles && config.aiContextFiles.enabled)
      ? checkAiContextFiles(config.aiContextFiles.requiredFiles)
      : [];

    // Menjalankan Lightweight AST Linter untuk mendeteksi sisa debugging (console.log / debugger)
    const linterViolations: any[] = [];
    for (const file of filesToScan) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lintIssues = lintCode(file, content);
        for (const issue of lintIssues) {
          linterViolations.push({
            filePath: issue.filePath,
            line: issue.line,
            ruleId: 'console-debug-leftover',
            message: issue.message,
            snippet: issue.snippet
          });
        }
      }
    }

    const allViolations = [
      ...astViolations, 
      ...secretViolations, 
      ...contextViolations,
      ...linterViolations
    ];

    if (allViolations.length > 0) {
      console.error(`\n[TAPIS] Violations Detected (${allViolations.length}):\n`);
      
      let allPromptsForClipboard = "";
      allViolations.forEach((v, idx) => {
        console.log(`--------------------------------------------------`);
        console.log(`[${idx + 1}] Target     : ${v.filePath}${v.line ? ':' + v.line : ''}`);
        console.log(`    Rule ID      : ${v.ruleId}`);
        console.log(`    Cause        : ${v.message}`);
        console.log(`    Snippet      : ${v.snippet}`);
        const promptText = generateAiPrompt(v);
        console.log(`    AI Prompt    : "${promptText}"`);
        allPromptsForClipboard += `\n\n` + promptText;
      });
      console.log(`--------------------------------------------------\n`);

      // Fitur Auto-Copy AI Prompt ke Clipboard secara otomatis
      if (allPromptsForClipboard.trim()) {
        const copied = copyToClipboard(allPromptsForClipboard.trim());
        if (copied) {
          console.log("[TAPIS] Draf prompt perbaikan berhasil disalin otomatis ke clipboard.");
        }
      }

      process.exit(1);
    } else {
      console.log("[TAPIS] All checks passed successfully!");
      process.exit(0);
    }
  } catch (error: any) {
    console.error(`[TAPIS ERROR] ${error.message}`);
    process.exit(1);
  }
} else {
  console.log(`Unknown command: ${command}`);
  console.log(`Usage: tapis check | tapis init-hook`);
  process.exit(1);
}
