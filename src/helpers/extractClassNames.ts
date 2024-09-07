import { CONFIG_SECTION } from "../envs";
import { getRelativeConfiguration } from "./getRelativeConfiguration";
import { replaceCommentsWithEmptySpace } from "./replaceCommentsWithEmptySpace";

export function extractClassNames(content: string) {
  const config = getRelativeConfiguration(CONFIG_SECTION);
  const classAttributes = ["class", "className", "styleClass", "ngClass", "class:list", ...config.get("classAttributes", [])];

  const classRegex = new RegExp(
    String.raw`\b((${classAttributes.join("|")})\s*=\s*[{]?\s*['"\`])([^'"\`{}]*)(['"\`](?:\s*[}])?)`,
    "g"
  );

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