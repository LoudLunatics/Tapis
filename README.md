# Tapis

Tapis is a lightweight, high-performance architectural guardrail and security CLI tool designed for AI-assisted development workflows. It prevents structural regressions, blocks hardcoded credentials, cleans up leftover debugging artifacts, and enforces workspace context rules locally before code integration—optimized specifically for fast, zero-daemon execution.

## Features

- **AST-Based Boundary Enforcement:** Uses the TypeScript Compiler API to analyze module imports across React, Vue, and Express codebases and prevent layer violations.
- **Secret Scanner:** Scans source code for hardcoded API keys, JWT tokens, and sensitive credentials using pattern matching.
- **AI Context Sentinel:** Verifies the presence of required governance files (such as `claude.md` or `.cursorrules`) in the project root.
- **Lightweight AST Linter:** Automatically detects and flags leftover debugging artifacts like `console.log` or `debugger` statements before production.
- **Git-Diff & Incremental Caching:** Scans only modified/staged files and utilizes local caching (`.tapiscache`) for sub-millisecond execution speed ("laptop-kentang" friendly).
- **Auto-Copy AI Prompt:** Automatically copies structured, authoritative anti-hallucination remediation prompts directly to your system clipboard upon violation detection.
- **Git Interceptor:** Installs a native pre-commit hook to block commits containing unresolved violations.

## Installation

To install Tapis globally from a local clone:

```bash
npm install -g .
```

## Configuration

Create a `tapis.config.json` file in the root directory of the target project:

```json
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
```

## Usage

- Run manual incremental checks:
  ```bash
  tapis check
  ```

- Install the Git pre-commit hook:
  ```bash
  tapis init-hook
  ```

## License

MIT
