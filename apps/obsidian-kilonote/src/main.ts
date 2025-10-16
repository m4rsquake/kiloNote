import { MarkdownView, Notice, Plugin, WorkspaceLeaf } from "obsidian"

import { DEFAULT_SETTINGS, KiloNoteSettingTab, KiloNoteSettings } from "./settings"
import { KiloNoteMessage, KiloNoteSelectionPayload, KiloNoteView, VIEW_TYPE_KILONOTE } from "./view"

const COMMAND_ID_SELECTION = "kilonote-send-selection"

export default class KiloNotePlugin extends Plugin {
	settings: KiloNoteSettings = { ...DEFAULT_SETTINGS }
	private selectionCommand?: string

	async onload(): Promise<void> {
		await this.loadSettings()

		this.registerView(VIEW_TYPE_KILONOTE, (leaf: WorkspaceLeaf) => new KiloNoteView(leaf, this))

		this.addRibbonIcon("bot", "Open KiloNote", () => {
			void this.activateKiloNoteView()
		})

		this.addCommand({
			id: "kilonote-open",
			name: "Open KiloNote",
			callback: () => {
				void this.activateKiloNoteView()
			},
		})

		if (this.settings.enableSelectionCommand) {
			this.registerSelectionCommand()
		}

		this.addSettingTab(new KiloNoteSettingTab(this.app, this))
	}

	async onunload(): Promise<void> {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_KILONOTE)
	}

	async activateKiloNoteView(): Promise<void> {
		const workspace = this.app.workspace
		const existingLeaf = workspace.getLeavesOfType(VIEW_TYPE_KILONOTE)[0]

		if (existingLeaf) {
			workspace.revealLeaf(existingLeaf)
			return
		}

		const leaf = workspace.getRightLeaf(false)
		if (!leaf) {
			new Notice("Unable to open KiloNote view.")
			return
		}

		await leaf.setViewState({ type: VIEW_TYPE_KILONOTE, active: true })
		workspace.revealLeaf(leaf)
	}

	refreshKiloNoteViews(): void {
		const view = this.getKiloNoteView()
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
			name: "Send selection to KiloNote",
			editorCallback: (editor) => {
				if (!this.settings.enableSelectionCommand) {
					return
				}

				const selectedText = editor.getSelection()

				if (!selectedText) {
					new Notice("Select some text before sending it to KiloNote.")
					return
				}

				void this.dispatchSelection(selectedText)
			},
		}).id
	}

	private async dispatchSelection(selection: string): Promise<void> {
		const kiloNoteView = await this.ensureKiloNoteView()
		if (!kiloNoteView) {
			return
		}

		const payload: KiloNoteSelectionPayload = {
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
					console.warn("KiloNote: failed to read frontmatter", error)
				}
			}
		}

		const message: KiloNoteMessage = {
			...payload,
			origin: "obsidian",
			timestamp: Date.now(),
		}

		kiloNoteView.postMessage(message)
	}

	private async ensureKiloNoteView(): Promise<KiloNoteView | undefined> {
		await this.activateKiloNoteView()
		return this.getKiloNoteView()
	}

	private getKiloNoteView(): KiloNoteView | undefined {
		const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_KILONOTE)[0]
		if (!leaf) {
			return undefined
		}

		const view = leaf.view
		if (view instanceof KiloNoteView) {
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
