import { window, workspace } from "vscode";

export function getRelativeConfiguration(section: string) {
  const workspaceFolders = workspace.workspaceFolders;
  const isOnlyProject = workspaceFolders && workspaceFolders.length === 1;

  if (isOnlyProject) {
    return workspace.getConfiguration(section, workspaceFolders[0].uri);
  }

  const activeTextEditor = window.activeTextEditor;

  if (activeTextEditor) {
    const configForCurrentDocument = workspace.getConfiguration(section, activeTextEditor.document.uri);

    if (configForCurrentDocument) {
      return configForCurrentDocument;
    }
  }

  return workspace.getConfiguration(section);
}
