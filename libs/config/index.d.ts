import type { z } from 'zod';

export function configFilePath(): string;
export function configDirectory(): string;
export function loadConfig<T extends z.ZodType>(schema: T): z.output<T>;
export const instanceSchema: z.ZodObject<{
  id: z.ZodString;
  enabled: z.ZodDefault<z.ZodBoolean>;
  topic: z.ZodString;
}>;
export const commonSchema: z.ZodObject<{
  mqtt: z.ZodObject<{
    protocol: z.ZodDefault<z.ZodEnum<{ mqtt: 'mqtt'; mqtts: 'mqtts' }>>;
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    clientId: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    keepAliveSeconds: z.ZodDefault<z.ZodNumber>;
    reconnectDelayMs: z.ZodDefault<z.ZodNumber>;
  }>;
}>;
