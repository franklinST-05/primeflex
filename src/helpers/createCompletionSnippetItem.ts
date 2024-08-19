import { CompletionItem, CompletionItemKind, MarkdownString } from "vscode";
import { Snippet, SnippetKind } from "../primeflex/snippets";
import { primeflexFixedColors } from "../primeflex/colors";

export function createCompletionSnippetItem(snippet: Snippet, workspaceColors: Record<string, string>) {
	const completion = new CompletionItem(snippet.class);

	completion.documentation = new MarkdownString("### PrimeFlex\n");
	completion.documentation.appendCodeblock(snippet.style, "css");

	if (snippet.kind === SnippetKind.FixedColor) {
		completion.kind = CompletionItemKind.Color;
		completion.detail = primeflexFixedColors[snippet.colorVariableName];
	}

	if (snippet.kind === SnippetKind.DynamicColor) {
		completion.kind = CompletionItemKind.Color;
		completion.detail = workspaceColors[snippet.colorVariableName];
	}

	return completion;
}