import { ItemView, Notice, WorkspaceLeaf } from "obsidian"
import type KiloNotePlugin from "./main"

export const VIEW_TYPE_KILONOTE = "kilonote-view"

export interface KiloNoteSelectionPayload {
	type: "selection"
	text: string
	filePath?: string
	frontmatter?: Record<string, unknown>
}

export interface KiloNoteMessage extends KiloNoteSelectionPayload {
	origin: "obsidian"
	timestamp: number
}

export class KiloNoteView extends ItemView {
	private iframe?: HTMLIFrameElement
	private statusEl?: HTMLElement

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: KiloNotePlugin,
	) {
		super(leaf)
	}

	getViewType(): string {
		return VIEW_TYPE_KILONOTE
	}

	getDisplayText(): string {
		return "KiloNote"
	}

	getIcon(): string {
		return "bot"
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this

		contentEl.empty()
		contentEl.addClass("kilonote-view")

		this.statusEl = contentEl.createDiv({ cls: "kilonote-status" })
		this.statusEl.textContent = "Connecting to KiloNote…"

		this.iframe = contentEl.createEl("iframe", {
			cls: "kilonote-frame",
		})

		this.iframe.setAttr(
			"sandbox",
			["allow-scripts", "allow-same-origin", "allow-downloads", "allow-popups", "allow-forms"].join(" "),
		)

		this.iframe.addEventListener("load", () => {
			if (this.statusEl) {
				this.statusEl.textContent = "KiloNote is ready."
			}
		})

		this.updateSource()
	}

	onClose(): void {
		if (this.iframe) {
			this.iframe.remove()
			this.iframe = undefined
		}

		if (this.statusEl) {
			this.statusEl.remove()
			this.statusEl = undefined
		}
	}

	updateSource(): void {
		if (!this.iframe) {
			return
		}

		const url = this.plugin.settings.webAppUrl?.trim()

		if (!url) {
			if (this.statusEl) {
				this.statusEl.textContent = "Invalid KiloNote web application URL"
			}
			return
		}

		try {
			const parsed = new URL(url)
			this.iframe.src = parsed.toString()
		} catch (error) {
			console.error("Failed to parse KiloNote URL", error)
			if (this.statusEl) {
				this.statusEl.textContent = "KiloNote URL is not valid. Update it in the plugin settings."
			} else {
				new Notice("KiloNote URL is not valid. Update it in the plugin settings.")
			}
		}
	}

	postMessage(message: KiloNoteMessage): void {
		if (!this.iframe?.contentWindow) {
			new Notice("KiloNote view is not ready yet.")
			return
		}

		this.iframe.contentWindow.postMessage(message, "*")
	}
}
