import { replaceCommentsWithEmptySpace } from "./replaceCommentsWithEmptySpace";

const rootBlockRegex = /:root\s*{([^}]*)}/g;
const colorRegex = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+\s*)?\)|hsla?\(\s*\d{1,3}\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\)|hwb\(\s*\d{1,3}\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|lab\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|lch\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|color\(\s*[a-zA-Z0-9-]+\s*[\d\s,.%/]+\)|\b[a-zA-Z]+\b)\s*;/g;

export function extractCssRootColors(content: string): Record<string, string> {
  content = replaceCommentsWithEmptySpace(content);
  const colorVariables: Record<string, string> = {};

  let rootMatch;

  while((rootMatch = rootBlockRegex.exec(content))) {
    const rootContent = rootMatch[1];

    let match;
    while ((match = colorRegex.exec(rootContent))) {
      const [_, name, value] = match;
      colorVariables[name] = value.trim();
    }
  }

  return colorVariables;
}