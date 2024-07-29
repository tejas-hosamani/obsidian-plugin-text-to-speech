import ListenUp from "main";
import { App, PluginSettingTab, Setting, normalizePath } from "obsidian";

export interface ListenUpSettingsTab {
	customModelFilePath: string;
	customModelConfigFilePath: string;
	piperExecutableFilePath: string;
	shouldUseCustomModel: boolean;
}

export const DEFAULT_SETTINGS: ListenUpSettingsTab = {
	customModelFilePath: "",
	customModelConfigFilePath: "",
	piperExecutableFilePath: "",
	shouldUseCustomModel: true,
};

export class SettingsTab extends PluginSettingTab {
	plugin: ListenUp;

	constructor(app: App, plugin: ListenUp) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		this.addSettingToSelectPiperExecutablePath(containerEl);
		// this.addSettingsToChooseWhetherToUseCustomModelOrDefault(containerEl);
		// if (this.plugin.settings.shouldUseCustomModel) {
			this.addSettingToSelectModelFilePath(containerEl);
			this.addSettingToSelectModelConfigFilePath(containerEl);
		// }
	}

	addSettingToSelectModelFilePath(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Select custom model file")
			.setDesc(`Leave this empty to use the default model that comes with this plugin`)
			.addText((component) => {
				component.setDisabled(true);
				component.setValue(this.plugin.settings.customModelFilePath);
			})
			.addExtraButton((component) => {
				component.setIcon("folder-open");
				component.setTooltip("Select model");

				component.onClick(() => {
					// @ts-ignore
					electron.remote.dialog
						.showOpenDialog({
							properties: ["openFile"],
							title: "Select a model",
						})
						.then((result: any) => {
							if (result.canceled) return;

							this.plugin.settings.customModelFilePath = result.filePaths[0];
							this.plugin.saveSettings();
							this.display();
						});
				});
			});
	}

	addSettingToSelectModelConfigFilePath(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Select Model config file")
			.setDesc(`Make sure to add config file if you are using custom model`)
			.addText((component) => {
				component.setDisabled(true);
				component.setValue(this.plugin.settings.customModelConfigFilePath);
			})
			.addExtraButton((component) => {
				component.setIcon("folder-open");
				component.setTooltip("Select model config");

				component.onClick(() => {
					// @ts-ignore
					electron.remote.dialog
						.showOpenDialog({
							properties: ["openFile"],
							title: "Select a model config",
						})
						.then((result: any) => {
							if (result.canceled) return;

							this.plugin.settings.customModelConfigFilePath = result.filePaths[0];
							this.plugin.saveSettings();
							this.display();
						});
				});
			});
	}

	addSettingsToChooseWhetherToUseCustomModelOrDefault(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Use custom model?")
			.setDesc(`Turn this on if you want to use different voice model. Check this doc to understand more: DOC LINK`)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.shouldUseCustomModel);
				component.onChange((value) => {
					this.plugin.settings.shouldUseCustomModel = value;
					this.plugin.saveSettings();
					this.display()
				});
			});
	}

	addSettingToSelectPiperExecutablePath(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName("Select Piper executable file")
			.setDesc(`This is required`)
			.addText((component) => {
				component.setDisabled(true);
				component.setValue(this.plugin.settings.piperExecutableFilePath);
			})
			.addExtraButton((component) => {
				component.setIcon("folder-open");
				component.setTooltip("Select piper executable");
				component.onClick(() => {
					// @ts-ignore
					electron.remote.dialog
						.showOpenDialog({
							properties: ["openFile"],
							title: "Select piper executable",
						})
						.then((result: any) => {
							if (result.canceled) return;

							this.plugin.settings.piperExecutableFilePath = result.filePaths[0];
							this.plugin.saveSettings();
							this.display();
						});
				});
			});
	}
}
