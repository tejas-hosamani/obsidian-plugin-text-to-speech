import {
	normalizePath,
	Notice,
	Plugin,
} from "obsidian";
import { exec } from "child_process";
import { removeAllFormatting } from "utils/removeFormatting";
import { getBasePath } from "utils/utils";
import { DEFAULT_SETTINGS, SettingsTab } from "Settings";

export default class ListenUp extends Plugin {
	settings: any;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this.app, this));

		this.addCommand({
			id: "convert-text-to-speech",
			name: "Convert Text to Speech",
			editorCallback: async (editor, _) => {
				const notice = new Notice(
					"Converting the text to natural speech, please wait..",
					0
				);

				const basePath = getBasePath();
				const currentFile = this.app.workspace.getActiveFile();
				const audioFileName =
					// @ts-ignore
					currentFile?.name.replaceAll(" ", "-") +
					"-" +
					this.getRandomNumber() +
					".wav";

				const piperLocation = normalizePath(this.settings.piperExecutableFilePath);
				let modelPath = normalizePath(basePath + '/' + DEFAULT_SETTINGS.customModelFilePath);
				let modelConfigPath =
					normalizePath(basePath + '/' + DEFAULT_SETTINGS.customModelConfigFilePath);

				const outputFilePath = normalizePath(basePath + '/' + audioFileName)

				// if (this.settings.shouldUseCustomModel) {
					modelPath = normalizePath(this.settings.customModelFilePath);
					modelConfigPath = normalizePath(this.settings.customModelConfigFilePath);
				// }

				const piperCommand = `${piperLocation} --model ${modelPath} --config ${modelConfigPath} --output_file ${outputFilePath} --sentence_silence 0.5 --length_scale 1`;

				let textToConvertToAudio = editor.getValue();
				const regExMatch = textToConvertToAudio.match(
					/{{listen}}([\s\S]*?){{\/listen}}/g
				);

				const userSelection = editor.getSelection();

				if (regExMatch !== null) {
					textToConvertToAudio = regExMatch
						.join(", ")
						// @ts-ignore
						.replaceAll(/{{listen}}|{{\/listen}}/g, "");
				} else if (userSelection.length) {
					textToConvertToAudio = userSelection;
				}

				textToConvertToAudio = removeAllFormatting(
					textToConvertToAudio ?? " ",
					{}
					// @ts-ignore
				).replaceAll('"', '\\"');

				exec(
					`echo "${textToConvertToAudio}" | ${piperCommand}`,
					async (error) => {
						if (error) {
							console.error(`\n\nerror: ${error.message}`);
							notice.setMessage("Something went wrong. Please raise an issue on Github or Discord")
							return;
						}

						await currentFile?.vault.append(
							currentFile,
							`![[${audioFileName}]] \n\n`
						);

						setTimeout(() => {
							editor.setCursor(editor.lastLine());
							notice.hide();
						}, 200);
					}
				);
			},
		});

	}

	async onunload() {
	// Release any resources configured by the plugin.
	}

	getRandomNumber(min: number = 10000, max: number = 99999) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	async loadSettings() {
		const data = (await this.loadData()) || {};
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	/**
	 * Save data to disk, stored in data.json in plugin folder
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
