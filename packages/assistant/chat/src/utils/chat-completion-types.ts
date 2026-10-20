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

export interface ChatCompletionChoiceMessage {
  role?: string;
  content?: string | null;
  tool_calls?: ChatCompletionMessageToolCall[];
}

export interface ChatCompletion {
  choices: Array<{
    message?: ChatCompletionChoiceMessage;
    finish_reason?: string | null;
  }>;
}

export type ChatCompletionToolChoice = 'none' | 'auto' | 'required';

export interface ChatCompletionCreateParams {
  messages: ChatCompletionMessageParam[];
  tools?: ChatCompletionTool[];
  tool_choice?: ChatCompletionToolChoice;
}

export interface ChatCompletionsClient {
  create: (params: ChatCompletionCreateParams) => Promise<ChatCompletion>;
}
