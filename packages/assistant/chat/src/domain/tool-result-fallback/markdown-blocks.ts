const MARKDOWN_LIST_ITEM = /^(?:[-*+]|\d+\.)\s/;

/** Separate blocks so the chat Markdown renderer keeps them apart. */
export function joinMarkdownBlocks(
  blocks: Array<string | null | undefined>,
): string {
  return blocks
    .map((block) => (typeof block === 'string' ? block.trim() : ''))
    .filter(Boolean)
    .join('\n\n');
}

/** Bullet list. A single newline between plain lines is collapsed to a space. */
export function asMarkdownList(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (MARKDOWN_LIST_ITEM.test(line) ? line : `- ${line}`))
    .join('\n');
}
