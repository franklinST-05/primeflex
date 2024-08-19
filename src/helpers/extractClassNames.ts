import { replaceCommentsWithEmptySpace } from "./replaceCommentsWithEmptySpace";

const classRegex = /\b((class|className|ngClass)\s*=\s*[{]?\s*['"`])([^'"`{}]*)(['"`](?:\s*[}])?)/g;

export function extractClassNames(content: string) {
  content = replaceCommentsWithEmptySpace(content);
  const matches = Array.from(content.matchAll(classRegex));

  const result = [];

  let index = 0;
  while(index < matches.length) {
    const matchResult = matches[index];

    result.push({
      result: matchResult,
      attribute: matchResult[2],
      raw: matchResult[0],
      value: matchResult[3],
      startQuoteIndex: matchResult.index + matchResult[1].length,
      closeQuoteIndex: matchResult.index + matchResult[0].length,
      index: matchResult.index,
    });

    index++;
  }

  return result;
}