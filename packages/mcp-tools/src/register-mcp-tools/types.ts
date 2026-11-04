import type { z } from 'zod';
import type { MCP_TOOLS } from '../tools.js';

type InputSchemaOf<T> = T extends { inputSchema: infer S } ? S : never;

type ArgsFromDef<T> = [InputSchemaOf<T>] extends [never]
  ? undefined
  : InputSchemaOf<T> extends Record<string, z.ZodTypeAny>
    ? z.infer<z.ZodObject<InputSchemaOf<T>>>
    : undefined;

export type McpToolArgs = {
  [K in keyof typeof MCP_TOOLS]: ArgsFromDef<(typeof MCP_TOOLS)[K]>;
};

export type McpToolHandlers = {
  [K in keyof typeof MCP_TOOLS]: (
    args: McpToolArgs[K],
  ) => Promise<unknown>;
};

export type McpToolName = keyof typeof MCP_TOOLS;
