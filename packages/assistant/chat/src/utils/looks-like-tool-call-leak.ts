export function looksLikeToolCallLeak(content: string): boolean {
  const text = content.trim();
  if (!text) {
    return false;
  }

  return (
    /<\s*dots_function_call\b/i.test(text)
    || /<\s*function_call\b/i.test(text)
    || /<\s*tool_call\b/i.test(text)
    || /<\s*invoke\b/i.test(text)
    || /<\/\s*tool_call\s*>/i.test(text)
    || /\btool_calls?\s*[:=]\s*\[/i.test(text)
  );
}
