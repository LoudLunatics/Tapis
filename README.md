Tapis

Tapis is a lightweight architectural guardrail and security CLI tool designed for AI-assisted development workflows. It prevents structural regressions, blocks hardcoded credentials, and enforces workspace context rules locally before code integration.

Features

AST-Based Boundary Enforcement: Uses the TypeScript Compiler API to analyze module imports across React, Vue, and Express codebases and prevent layer violations.

Secret Scanner: Scans source code for hardcoded API keys, JWT tokens, and sensitive credentials using pattern matching.

AI Context Sentinel: Verifies the presence of required governance files (such as claude.md or .cursorrules) in the project root.

Anti-Hallucination Prompt Generator: Generates deterministic remediation instructions with strict negative constraints when violations are detected.

Git Interceptor: Installs a native pre-commit hook to block commits containing unresolved violations.

Installation

To install Tapis globally from a local clone:

npm install -g .


Configuration

Create a tapis.config.json file in the root directory of the target project:

{
  "boundaries": [
    {
      "target": "src/components/**/*.tsx",
      "forbiddenImports": ["@supabase/supabase-js", "pg", "mysql2"],
      "ruleId": "no-db-in-ui",
      "message": "UI components must not directly import database modules."
    }
  ],
  "secretScanning": {
    "enabled": true,
    "patterns": [
      "eyJ[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+",
      "sk_live_[0-9a-zA-Z]{24,}"
    ]
  },
  "aiContextFiles": {
    "enabled": true,
    "requiredFiles": ["claude.md", ".cursorrules"]
  }
}


Usage

Run manual checks:

tapis check


Install the Git pre-commit hook:

tapis init-hook


License

MIT
