import { Violation } from './ast-sentinel';

export function generateAiPrompt(violation: Violation): string {
  if (violation.ruleId === 'missing-ai-context') {
    return `
[TAPIS ARCHITECTURAL GUARDRAIL]
- Issue: Missing mandatory AI context configuration file '${violation.filePath}'.
- Impact: AI is operating without architectural bounds, increasing the risk of code hallucination.
- ACTION REQUIRED: Immediately create the '${violation.filePath}' file in the root directory. Do not proceed with feature implementation until this context file is established.
    `.trim();
  }

  if (violation.ruleId === 'hardcoded-secret') {
    return `
[TAPIS SECURITY VIOLATION]
- File: ${violation.filePath} (Line ${violation.line})
- Offending Code: "${violation.snippet}"
- ISSUE: Hardcoded secret, API key, or token detected in source code.
- INSTRUCTION: Strip out the hardcoded secret immediately. Move configuration values into environment variables (.env).
- STRICT CONSTRAINT: Do not hardcode fallback strings, do not invent custom configuration loaders, and strictly use standard process.env.
    `.trim();
  }
  
  if (violation.ruleId === 'console-debug-leftover') {
    return `
[TAPIS CODE HYGIENE LINTER]
- File: ${violation.filePath} (Line ${violation.line})
- Artifact Found: "${violation.snippet}"
- INSTRUCTION: Clean up leftover debugging artifacts before finalizing code.
- CONSTRAINT: Remove all stray console statements and debuggers from production-ready files.
    `.trim();
  }

  return `
[TAPIS BOUNDARY VIOLATION DETECTED]
- Target File: ${violation.filePath} (Line ${violation.line})
- Rule Triggered: ${violation.ruleId}
- Violation Details: ${violation.message}
- Problematic Code: "${violation.snippet}"

MANDATORY FIX INSTRUCTIONS:
1. Isolate and remove the forbidden pattern or import from this file.
2. Delegate this logic to the proper architectural layer as defined by the project structure.
3. STRICT CONSTRAINT: Do not guess, invent, or hallucinate module paths. Inspect existing workspace files first to ensure absolute path accuracy.
  `.trim();
}
