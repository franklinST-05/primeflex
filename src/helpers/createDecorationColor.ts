import { window as Window } from "vscode";

export function createDecorationColor(backgroundColor: string) {
	return Window.createTextEditorDecorationType({
		before: {
			width: "0.8em",
			height: "0.8em",
			contentText: " ",
			backgroundColor,
			border: "0.1em solid",
			margin: "0.1em 0.2em 0"
		},
		dark: {
			before: {
				borderColor: "#eeeeee",
			},
		},
		light: {
			before: {
				borderColor: "#000000",
			},
		}
	});
}