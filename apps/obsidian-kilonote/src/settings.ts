import { App, PluginSettingTab, Setting } from "obsidian"
import type KiloNotePlugin from "./main"

export interface KiloNoteSettings {
	/**
	 * Base URL that hosts the KiloNote web experience.
	 * The plugin embeds this URL inside an iframe.
	 */
	webAppUrl: string
	/**
	 * Automatically send the currently selected text to KiloNote
	 * when the dedicated command is executed.
	 */
	enableSelectionCommand: boolean
	/**
	 * Automatically push file metadata along with the selection payload.
	 */
	includeFileMetadata: boolean
}

export const DEFAULT_SETTINGS: KiloNoteSettings = {
	webAppUrl: "https://kilonote.app/obsidian",
	enableSelectionCommand: true,
	includeFileMetadata: true,
}

export class KiloNoteSettingTab extends PluginSettingTab {
	private readonly plugin: KiloNotePlugin

	constructor(app: App, plugin: KiloNotePlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()
		containerEl.createEl("h2", { text: "KiloNote" })
		containerEl.createEl("p", {
			text: "Configure how the KiloNote assistant is embedded within Obsidian.",
		})

		new Setting(containerEl)
			.setName("KiloNote web application URL")
			.setDesc(
				"The URL that hosts the KiloNote experience. Update this if you self-host the web client or need to opt into experimental builds.",
			)
			.addText((text) =>
				text
					.setPlaceholder("https://kilonote.app/obsidian")
					.setValue(this.plugin.settings.webAppUrl)
					.onChange(async (value) => {
						this.plugin.settings.webAppUrl = value.trim() || DEFAULT_SETTINGS.webAppUrl
						await this.plugin.saveSettings()
						this.plugin.refreshKiloNoteViews()
					}),
			)

		new Setting(containerEl)
			.setName('Enable "Send selection to KiloNote" command')
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
			.setDesc("Attach the file path and frontmatter (when available) to the payload that is sent to KiloNote.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.includeFileMetadata).onChange(async (value) => {
					this.plugin.settings.includeFileMetadata = value
					await this.plugin.saveSettings()
				}),
			)
	}
}
