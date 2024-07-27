import { FileSystemAdapter } from "obsidian";

export function getBasePath() {
	let adapter = this.app.vault.adapter;
	if (adapter instanceof FileSystemAdapter) {
		return adapter.getBasePath();
	}
	return "~/";
}
