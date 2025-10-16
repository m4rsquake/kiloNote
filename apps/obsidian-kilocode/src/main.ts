import { MarkdownView, Notice, Plugin, WorkspaceLeaf } from "obsidian"

import { DEFAULT_SETTINGS, KilocodeSettingTab, KilocodeSettings } from "./settings"
import { KilocodeMessage, KilocodeSelectionPayload, KilocodeView, VIEW_TYPE_KILOCODE } from "./view"

const COMMAND_ID_SELECTION = "kilocode-send-selection"

export default class KilocodePlugin extends Plugin {
	settings: KilocodeSettings = { ...DEFAULT_SETTINGS }
	private selectionCommand?: string

	async onload(): Promise<void> {
		await this.loadSettings()

		this.registerView(VIEW_TYPE_KILOCODE, (leaf: WorkspaceLeaf) => new KilocodeView(leaf, this))

		this.addRibbonIcon("bot", "Open Kilocode", () => {
			void this.activateKilocodeView()
		})

		this.addCommand({
			id: "kilocode-open",
			name: "Open Kilocode",
			callback: () => {
				void this.activateKilocodeView()
			},
		})

		if (this.settings.enableSelectionCommand) {
			this.registerSelectionCommand()
		}

		this.addSettingTab(new KilocodeSettingTab(this.app, this))
	}

	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_KILOCODE)
	}

	async activateKilocodeView(): Promise<void> {
		const workspace = this.app.workspace
		const existingLeaf = workspace.getLeavesOfType(VIEW_TYPE_KILOCODE)[0]

		if (existingLeaf) {
			workspace.revealLeaf(existingLeaf)
			return
		}

		const leaf = workspace.getRightLeaf(false)
		if (!leaf) {
			new Notice("Unable to open Kilocode view.")
			return
		}

		await leaf.setViewState({ type: VIEW_TYPE_KILOCODE, active: true })
		workspace.revealLeaf(leaf)
	}

	refreshKilocodeViews(): void {
		const view = this.getKilocodeView()
		view?.updateSource()
	}

	toggleSelectionCommand(enabled: boolean): void {
		if (enabled) {
			this.registerSelectionCommand()
		} else if (this.selectionCommand) {
			this.app.commands.removeCommand(this.selectionCommand)
			this.selectionCommand = undefined
		}
	}

	private registerSelectionCommand(): void {
		if (this.selectionCommand) {
			this.app.commands.removeCommand(this.selectionCommand)
		}

		this.selectionCommand = this.addCommand({
			id: COMMAND_ID_SELECTION,
			name: "Send selection to Kilocode",
			editorCallback: (editor) => {
				if (!this.settings.enableSelectionCommand) {
					return
				}

				const selectedText = editor.getSelection()

				if (!selectedText) {
					new Notice("Select some text before sending it to Kilocode.")
					return
				}

				void this.dispatchSelection(selectedText)
			},
		}).id
	}

	private async dispatchSelection(selection: string): Promise<void> {
		const kilocodeView = await this.ensureKilocodeView()
		if (!kilocodeView) {
			return
		}

		const payload: KilocodeSelectionPayload = {
			type: "selection",
			text: selection,
		}

		if (this.settings.includeFileMetadata) {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
			const file = activeView?.file ?? this.app.workspace.getActiveFile()

			if (file) {
				payload.filePath = file.path

				try {
					const cache = this.app.metadataCache.getFileCache(file)
					if (cache?.frontmatter) {
						payload.frontmatter = { ...cache.frontmatter }
					}
				} catch (error) {
					console.warn("Kilocode: failed to read frontmatter", error)
				}
			}
		}

		const message: KilocodeMessage = {
			...payload,
			origin: "obsidian",
			timestamp: Date.now(),
		}

		kilocodeView.postMessage(message)
	}

	private async ensureKilocodeView(): Promise<KilocodeView | undefined> {
		await this.activateKilocodeView()
		return this.getKilocodeView()
	}

	private getKilocodeView(): KilocodeView | undefined {
		const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_KILOCODE)[0]
		if (!leaf) {
			return undefined
		}

		const view = leaf.view
		if (view instanceof KilocodeView) {
			return view
		}

		return undefined
	}

	async loadSettings(): Promise<void> {
		const data = await this.loadData()
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data)
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings)
	}
}
