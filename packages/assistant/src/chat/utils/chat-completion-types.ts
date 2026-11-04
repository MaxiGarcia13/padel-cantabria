export interface ChatCompletionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface ChatCompletionMessageToolCall {
  id: string;
  type?: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export type ChatCompletionMessageParam
  = | { role: 'system'; content: string }
    | { role: 'user'; content: string }
    | {
      role: 'assistant';
      content?: string | null;
      tool_calls?: ChatCompletionMessageToolCall[];
    }
    | { role: 'tool'; tool_call_id: string; content: string };
