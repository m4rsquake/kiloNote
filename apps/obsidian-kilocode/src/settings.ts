import { App, PluginSettingTab, Setting } from "obsidian"
import type KilocodePlugin from "./main"

export interface KilocodeSettings {
	/**
	 * Base URL that hosts the Kilocode web experience.
	 * The plugin embeds this URL inside an iframe.
	 */
	webAppUrl: string
	/**
	 * Automatically send the currently selected text to Kilocode
	 * when the dedicated command is executed.
	 */
	enableSelectionCommand: boolean
	/**
	 * Automatically push file metadata along with the selection payload.
	 */
	includeFileMetadata: boolean
}

export const DEFAULT_SETTINGS: KilocodeSettings = {
	webAppUrl: "https://kilocode.app/obsidian",
	enableSelectionCommand: true,
	includeFileMetadata: true,
}

export class KilocodeSettingTab extends PluginSettingTab {
	private readonly plugin: KilocodePlugin

	constructor(app: App, plugin: KilocodePlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()
		containerEl.createEl("h2", { text: "Kilocode" })
		containerEl.createEl("p", {
			text: "Configure how the Kilocode assistant is embedded within Obsidian.",
		})

		new Setting(containerEl)
			.setName("Kilocode web application URL")
			.setDesc(
				"The URL that hosts the Kilocode experience. Update this if you self-host the web client or need to opt into experimental builds.",
			)
			.addText((text) =>
				text
					.setPlaceholder("https://kilocode.app/obsidian")
					.setValue(this.plugin.settings.webAppUrl)
					.onChange(async (value) => {
						this.plugin.settings.webAppUrl = value.trim() || DEFAULT_SETTINGS.webAppUrl
						await this.plugin.saveSettings()
						this.plugin.refreshKilocodeViews()
					}),
			)

		new Setting(containerEl)
			.setName('Enable "Send selection to Kilocode" command')
			.setDesc("If disabled the command is hidden from the command palette.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableSelectionCommand).onChange(async (value) => {
					this.plugin.settings.enableSelectionCommand = value
					await this.plugin.saveSettings()
					this.plugin.toggleSelectionCommand(value)
				}),
			)

		new Setting(containerEl)
			.setName("Include file metadata")
			.setDesc("Attach the file path and frontmatter (when available) to the payload that is sent to Kilocode.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.includeFileMetadata).onChange(async (value) => {
					this.plugin.settings.includeFileMetadata = value
					await this.plugin.saveSettings()
				}),
			)
	}
}
