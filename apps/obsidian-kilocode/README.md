# Kilocode Obsidian Plugin

The Kilocode Obsidian plugin brings the Kilocode AI assistant directly into Obsidian. The plugin embeds the familiar Kilocode sidebar experience in a native Obsidian view and adds commands that allow you to push selected text into the assistant.

## Features

- Open the Kilocode assistant from the ribbon or the command palette.
- Send the currently selected text (and optional file metadata) to Kilocode with a single command.
- Configure the Kilocode web application URL when self-hosting or using preview builds.

## Development

```bash
pnpm install
pnpm --filter obsidian-kilocode build
```

The build step emits `main.js` in the plugin directory, which can be copied into your Obsidian vault's plugins folder for testing. During development run the build with the `--watch` flag to automatically rebuild on changes.
