import { primeflexSnippets, SnippetKind } from "./snippets";
import { primeflexBreakpoints, primeflexPseudoStates } from "./utils";

export const primeflexFixedColors: Record<string, string> = {
    "white": "#ffffff",
    "transparent": "#0000",
    "white-alpha-10": "rgba(255, 255, 255, 0.1)",
    "white-alpha-20": "rgba(255, 255, 255, 0.2)",
    "white-alpha-30": "rgba(255, 255, 255, 0.3)",
    "white-alpha-40": "rgba(255, 255, 255, 0.4)",
    "white-alpha-50": "rgba(255, 255, 255, 0.5)",
    "white-alpha-60": "rgba(255, 255, 255, 0.6)",
    "white-alpha-70": "rgba(255, 255, 255, 0.7)",
    "white-alpha-80": "rgba(255, 255, 255, 0.8)",
    "white-alpha-90": "rgba(255, 255, 255, 0.9)",
    "black-alpha-10": "rgba(0, 0, 0, 0.1)",
    "black-alpha-20": "rgba(0, 0, 0, 0.2)",
    "black-alpha-30": "rgba(0, 0, 0, 0.3)",
    "black-alpha-40": "rgba(0, 0, 0, 0.4)",
    "black-alpha-50": "rgba(0, 0, 0, 0.5)",
    "black-alpha-60": "rgba(0, 0, 0, 0.6)",
    "black-alpha-70": "rgba(0, 0, 0, 0.7)",
    "black-alpha-80": "rgba(0, 0, 0, 0.8)",
    "black-alpha-90": "rgba(0, 0, 0, 0.9)",
};

export const primeflexSnippetColors = primeflexSnippets.filter((snippet) => {
    return [SnippetKind.FixedColor, SnippetKind.DynamicColor].includes(snippet.kind);
});

/** list of all classNames with all behaviors, ex: `bg-primary`, `hover:bg-primary` ... */
export const primeflexColorClassNames: string[] = [];

for (const snippet of primeflexSnippetColors) {
	primeflexColorClassNames.push(snippet.class);

	if (snippet.pseudoState) {
		for (const state of primeflexPseudoStates) {
			primeflexColorClassNames.push(state.concat(snippet.class));
		}
	}

	if (snippet.responsive) {
		for (const state of primeflexBreakpoints) {
			primeflexColorClassNames.push(state.concat(snippet.class));
		}
	}
}

/** [className, snippet] @example primeflexSnippetColorsMap.get("bg-primary") // snippet */
export const primeflexSnippetColorsMap = new Map(primeflexSnippetColors.map((snippet) => {
    return [snippet.class, snippet];
}));
