import { ItemView, Notice, WorkspaceLeaf } from "obsidian"
import type KilocodePlugin from "./main"

export const VIEW_TYPE_KILOCODE = "kilocode-view"

export interface KilocodeSelectionPayload {
	type: "selection"
	text: string
	filePath?: string
	frontmatter?: Record<string, unknown>
}

export interface KilocodeMessage extends KilocodeSelectionPayload {
	origin: "obsidian"
	timestamp: number
}

export class KilocodeView extends ItemView {
	private iframe?: HTMLIFrameElement
	private statusEl?: HTMLElement

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: KilocodePlugin,
	) {
		super(leaf)
	}

	getViewType(): string {
		return VIEW_TYPE_KILOCODE
	}

	getDisplayText(): string {
		return "Kilocode"
	}

	getIcon(): string {
		return "bot"
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this

		contentEl.empty()
		contentEl.addClass("kilocode-view")

		this.statusEl = contentEl.createDiv({ cls: "kilocode-status" })
		this.statusEl.textContent = "Connecting to Kilocode…"

		this.iframe = contentEl.createEl("iframe", {
			cls: "kilocode-frame",
		})

		this.iframe.setAttr(
			"sandbox",
			["allow-scripts", "allow-same-origin", "allow-downloads", "allow-popups", "allow-forms"].join(" "),
		)

		this.iframe.addEventListener("load", () => {
			if (this.statusEl) {
				this.statusEl.textContent = "Kilocode is ready."
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
				this.statusEl.textContent = "Invalid Kilocode web application URL"
			}
			return
		}

		try {
			const parsed = new URL(url)
			this.iframe.src = parsed.toString()
		} catch (error) {
			console.error("Failed to parse Kilocode URL", error)
			if (this.statusEl) {
				this.statusEl.textContent = "Kilocode URL is not valid. Update it in the plugin settings."
			} else {
				new Notice("Kilocode URL is not valid. Update it in the plugin settings.")
			}
		}
	}

	postMessage(message: KilocodeMessage): void {
		if (!this.iframe?.contentWindow) {
			new Notice("Kilocode view is not ready yet.")
			return
		}

		this.iframe.contentWindow.postMessage(message, "*")
	}
}
