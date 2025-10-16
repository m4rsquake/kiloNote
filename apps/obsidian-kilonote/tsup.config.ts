import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/main.ts"],
	format: ["cjs"],
	target: "es2020",
	dts: false,
	clean: true,
	sourcemap: false,
	external: ["obsidian"],
})
