# 📝 KiloNote

KiloNote is an open-source Obsidian plugin that brings a dedicated AI
note-taking companion into your vault. Inspired by the capabilities of
Kilo Code, KiloNote focuses on long-form writing and research workflows,
letting you draft, refine, and organize your ideas without leaving
Obsidian.

<p align="center">
  <img src="./kilo.gif" width="100%" alt="KiloNote demo" />
</p>

## Key Capabilities

- **Stay in the flow:** Open the assistant from the ribbon or the command
  palette and keep your current note in view.
- **Context-aware suggestions:** Send selected text — along with optional
  file metadata and frontmatter — so the assistant always has the right
  context.
- **Configurable endpoint:** Point the plugin at a self-hosted KiloNote
  deployment or the hosted web application.
- **Keyboard friendly:** Trigger the "Send selection to KiloNote" command
  to quickly iterate on outlines, meeting notes, or research summaries.

## Getting Started

1. Clone this repository and install dependencies with `pnpm install`.
2. Build the plugin bundle:
    ```bash
    pnpm --filter obsidian-kilonote build
    ```
3. Copy the contents of `apps/obsidian-kilonote/dist` into
   `<your-vault>/.obsidian/plugins/kilo-note` (create the folder if it
   does not exist).
4. Enable **KiloNote** from Obsidian's **Community plugins** tab.

Once enabled, use the ribbon icon or run the `KiloNote: Open KiloNote`
command to open the assistant. Highlight text in any Markdown file and
run `KiloNote: Send selection to KiloNote` to push context into the
sidebar chat.

## Development

The Obsidian plugin lives in `apps/obsidian-kilonote`. During
development you can run the build in watch mode to automatically rebuild
on file changes:

```bash
pnpm --filter obsidian-kilonote build -- --watch
```

Obsidian supports hot reloading when the compiled plugin files change,
so keep the vault open while iterating.

## Project Layout

- `apps/obsidian-kilonote/` – Obsidian plugin source code, settings, and
  build tooling.
- `webview-ui/` – Shared web UI components leveraged by the embedded
  assistant panel.
- `scripts/` – Project automation utilities.

KiloNote started from the Kilo Code foundation but has been adapted for
note-taking, research, and knowledge management scenarios inside
Obsidian. Contributions and issue reports are welcome!
