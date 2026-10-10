import * as fs from 'fs';
import * as path from 'path';

export interface BoundaryRule {
  target: string;
  forbiddenImports: string[];
  ruleId: string;
  message: string;
}

export interface TapisConfig {
  boundaries: BoundaryRule[];
  secretScanning: {
    enabled: boolean;
    patterns: string[];
  };
  aiContextFiles?: {
    enabled: boolean;
    requiredFiles: string[];
  };
}

export function loadConfig(): TapisConfig {
  const configPath = path.resolve(process.cwd(), 'tapis.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error("Configuration file 'tapis.config.json' not found. Please create one in the root directory.");
  }
  const rawData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(rawData);
}
