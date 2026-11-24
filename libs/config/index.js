'use strict';
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { load } = require('js-yaml');
const { z } = require('zod');

const instanceSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[^/\s]+$/, 'id must not contain / or whitespace'),
  enabled: z.boolean().default(true),
  topic: z.string().min(1),
});

const commonSchema = z.object({
  mqtt: z.object({
    protocol: z.enum(['mqtt', 'mqtts']).default('mqtt'),
    host: z.string().min(1),
    port: z.number().int().positive().default(1883),
    clientId: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
    keepAliveSeconds: z.number().int().positive().default(30),
    reconnectDelayMs: z.number().int().positive().default(5000),
  }),
});

/** Resolve CONFIG_FILE, --config, or the default path relative to the working directory. */
function configFilePath() {
  const index = process.argv.indexOf('--config');
  return path.resolve(process.env.CONFIG_FILE ?? (index >= 0 ? process.argv[index + 1] : 'config/config.yml'));
}

function configDirectory() {
  return path.dirname(configFilePath());
}

/** Read YAML and apply the consumer's schema. Parsing errors propagate to the caller. */
function loadConfig(schema) {
  const file = configFilePath();
  if (!existsSync(file)) throw new Error(`Configuration file not found: ${file}`);
  return schema.parse(load(readFileSync(file, 'utf8')));
}

module.exports = { commonSchema, instanceSchema, configFilePath, configDirectory, loadConfig };
