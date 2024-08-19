import { primeflexColorClassNames } from "../primeflex/colors";
import { extractClassNames } from "./extractClassNames";

const classNameColorRegex = new RegExp(`(?<!\\S)(${primeflexColorClassNames.join("|")})(?!\\S)`, "g");

export function extractClassNameColors(content: string) {
	const matches = extractClassNames(content);
	const result = [];

	let classAttrIndex = 0;
	while (classAttrIndex < matches.length) {
		const attrMatch = matches[classAttrIndex];
		const content = attrMatch.value;

		let classMatch;
		while((classMatch = classNameColorRegex.exec(content)) !== null) {
			let value = classMatch[0];
			const parts = value.split(/\:/);

			if (parts.length >= 2) value = parts[1];

			result.push({
				value,
				index: attrMatch.index + attrMatch.result[1].length + classMatch.index!,
			});
		}

		classAttrIndex++;
	}

	return result;
}