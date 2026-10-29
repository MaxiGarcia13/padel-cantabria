const MARKDOWN_LIST_ITEM = /^(?:[-*+]|\d+\.)\s/;

export function joinMarkdownBlocks(
  blocks: Array<string | null | undefined>,
): string {
  return blocks
    .map((block) => (typeof block === 'string'
      ? block.trim()
      : ''))
    .filter(Boolean)
    .join('\n\n');
}

export function asMarkdownList(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (MARKDOWN_LIST_ITEM.test(line)
      ? line
      : `- ${line}`))
    .join('\n');
}
