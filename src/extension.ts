import { existsSync as existsFileSync, readFileSync } from "fs";
import { join as joinPath } from "path";
import {
    commands as Commands,
    CompletionItem,
    Disposable,
    ExtensionContext,
    languages as Languages,
    Range,
    TextEditor,
    TextEditorDecorationType,
    window as Window,
    workspace as Workspace,
    WorkspaceConfiguration,
    WorkspaceFolder
} from "vscode";
import { CONFIG_SECTION, LANGUAGES } from "./envs";
import { createCompletionSnippetItem } from "./helpers/createCompletionSnippetItem";
import { createDecorationColor } from "./helpers/createDecorationColor";
import { extractClassNameColors } from "./helpers/extractClassNameColors";
import { extractClassNames } from "./helpers/extractClassNames";
import { extractCssRootColors } from "./helpers/extractCssRootColors";
import { getRelativeConfiguration } from "./helpers/getRelativeConfiguration";
import { primeflexFixedColors, primeflexSnippetColorsMap } from "./primeflex/colors";
import { primeflexSnippets } from "./primeflex/snippets";
import { primeflexBreakpoints, primeflexPseudoStates } from "./primeflex/utils";

let isEnabled: boolean;
let workspaceConfig: WorkspaceConfiguration;
let currentWorkspace: WorkspaceFolder;
let colorDecorations: Record<string, TextEditorDecorationType>;
let workspaceColors: Record<string, string>;
let disposables: Disposable[] = [];

function commandRestart(context: ExtensionContext) {
    const command = Commands.registerCommand("primeflex.restart", () => {
        if (!isEnabled) {
            Window.showInformationMessage("Primeflex workspace is disabled!");
            return;
        }

        const editor = Window.activeTextEditor;
        if (editor) {
            const newWorkspace = Workspace.getWorkspaceFolder(editor.document.uri);
            if (newWorkspace) currentWorkspace = newWorkspace;
        }

        workspaceConfig = getRelativeConfiguration(CONFIG_SECTION);

        if (editor) {
            for (const key of Object.keys(colorDecorations)) {
                editor.setDecorations(colorDecorations[key], []);
            }
        }

        syncWorkspaceColorDecorations();	
        if (editor) renderColorDecorations(editor);

        const sourceTheme = workspaceConfig.get("sourceTheme", "./src/style.css");
        Window.showInformationMessage(`Restarted colors, path: ${sourceTheme}`);
    });

    context.subscriptions.push(command);
}

function provideCompletionItems(context: ExtensionContext) {
    const provider = Languages.registerCompletionItemProvider(LANGUAGES, {
        provideCompletionItems(document, position, token) {
            const completions: CompletionItem[] = [];
            const offset = document.offsetAt(position);

            const content = document.getText();
            const classNames = extractClassNames(content);

            const classNameIndex = classNames.findIndex((className) => {
                return offset >= className.startQuoteIndex && offset < className.closeQuoteIndex;
            });

            if (classNameIndex === -1) return null;

            const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9-\:]+/);
            const prefix = wordRange ? document.getText(wordRange) : "";

            const parts = prefix.split(/\:/);

            if (parts.length >= 2) {
                const [rawPrefix, className] = parts;
                const prefix = rawPrefix.concat(":");

                const classNameRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9-]+/);

                // responsive breakpoints
                if (primeflexBreakpoints.includes(prefix)) {
                    let index = 0;

                    while (index < primeflexSnippets.length && !token.isCancellationRequested) {
                        const snippet = primeflexSnippets[index];
                        if (snippet.responsive && snippet.class.startsWith(className)) {
                            const completion = createCompletionSnippetItem(snippet, workspaceColors);
                            completion.range = classNameRange;

                            completions.push(completion);
                        }

                        index++;
                    }

                    return completions;
                }

                // pseudo states
                if (primeflexPseudoStates.includes(prefix)) {
                    let index = 0;

                    while (index < primeflexSnippets.length && !token.isCancellationRequested) {
                        const snippet = primeflexSnippets[index];
                        if (snippet.pseudoState && snippet.class.startsWith(className)) {
                            const completion = createCompletionSnippetItem(snippet, workspaceColors);
                            completion.range = classNameRange;

                            completions.push(completion);
                        }

                        index++;
                    }

                    return completions;
                }
            }

            // global
            let index = 0;
            while (index < primeflexSnippets.length && !token.isCancellationRequested) {
                const snippet = primeflexSnippets[index];

                if (!prefix || snippet.class.startsWith(prefix)) {
                    const completion = createCompletionSnippetItem(snippet, workspaceColors);
                    if (prefix) completion.range = wordRange;

                    completions.push(completion);
                }

                index++;
            }

            return completions;
        },
    });

    disposables.push(provider);
    context.subscriptions.push(provider);
}

function onChangeActiveEditor(context: ExtensionContext) {
	const event = Window.onDidChangeActiveTextEditor((editor) => {
        if (!editor || !LANGUAGES.includes(editor.document.languageId)) return;
    
        const documentWorkspace = Workspace.getWorkspaceFolder(editor.document.uri);
        if (documentWorkspace && documentWorkspace !== currentWorkspace) {
            onChangeWorkspace(documentWorkspace);
        }
    
        renderColorDecorations(editor);
    });

    disposables.push(event);
    context.subscriptions.push(event);
}

function onChangeTextDocument(context: ExtensionContext) {
    const event = Workspace.onDidChangeTextDocument((event) => {
        if (LANGUAGES.includes(event.document.languageId)) {
            if (event.contentChanges.length) {
                const editor = Window.activeTextEditor;
                if (editor) renderColorDecorations(editor);
            }
        }
    });

    disposables.push(event);
    context.subscriptions.push(event);
}

function onStartExtension() {
	const editor = Window.activeTextEditor;
	if (editor) {
		const workspace = Workspace.getWorkspaceFolder(editor.document.uri);
		if (workspace) {
			onChangeWorkspace(workspace);
			renderColorDecorations(editor);
		}
	}
}

function onChangeWorkspace(newWorkspace: WorkspaceFolder) {
    currentWorkspace = newWorkspace;
    workspaceConfig = getRelativeConfiguration(CONFIG_SECTION);

    syncWorkspaceColorDecorations();
}

function renderColorDecorations(editor: TextEditor) {
	const content = editor.document.getText();
	const classes = extractClassNameColors(content);

	const ranges: Record<string, Range[]> = {};

	let index = 0;
	while(index < classes.length) {
		const className = classes[index];
		const snippet: any = primeflexSnippetColorsMap.get(className.value);

		if (snippet) {
			const startPosition = editor.document.positionAt(
				className.index,
			);
	
			const endPosition = editor.document.positionAt(
				className.index + className.value.length,
			);
	
			const range = new Range(startPosition, endPosition);
			ranges[snippet.colorVariableName] = [...(ranges[snippet.colorVariableName] ?? []), range];
		}

		index++;
	}

	for (const variableName of Object.keys(colorDecorations)) {
		const decoration = colorDecorations[variableName];
		editor.setDecorations(decoration, ranges[variableName] ?? []);
	}
}

function syncWorkspaceColorDecorations() {
	const sourceTheme = workspaceConfig.get("sourceTheme", "./src/style.css");
	const sourceThemePath = joinPath(currentWorkspace.uri.path, sourceTheme);

    // reset colors
    colorDecorations = {};
    workspaceColors = {};

    if (existsFileSync(sourceThemePath)) {
    	const file = readFileSync(sourceThemePath);
		const content = file.toString("utf-8");

		workspaceColors = extractCssRootColors(content);

		for (const variableName of Object.keys(workspaceColors)) {
			colorDecorations[variableName] = createDecorationColor(workspaceColors[variableName]);
		}
    }

	for (const variableName of Object.keys(primeflexFixedColors)) {
		colorDecorations[variableName] = createDecorationColor(primeflexFixedColors[variableName]);
	}
}

export function start(context: ExtensionContext) {
    provideCompletionItems(context);
    onChangeActiveEditor(context);
    onChangeTextDocument(context);

    onStartExtension();
}

export function deactivate() {
    workspaceConfig = undefined as any;
    currentWorkspace = undefined as any;
    colorDecorations = undefined as any;
    workspaceColors = undefined as any;

    for (const disposable of disposables) {
        disposable.dispose();
    }

    disposables = [];
}

export function activate(context: ExtensionContext) {
    workspaceConfig = getRelativeConfiguration(CONFIG_SECTION);
    isEnabled = workspaceConfig.get("enabled", true);

    commandRestart(context);

    const onChangeConfig = Workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("primeflex.enabled")) {
            workspaceConfig = getRelativeConfiguration(CONFIG_SECTION);
            isEnabled = workspaceConfig.get("enabled", true);

            isEnabled ? start(context) : deactivate();
        }
    });
    
    context.subscriptions.push(onChangeConfig);
    isEnabled ? start(context) : deactivate();
}
