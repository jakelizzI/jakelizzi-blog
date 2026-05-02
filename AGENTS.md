# AI Agent Rules

## Nix Environment

- This project uses Nix. The `bun` or `npm` commands may not be available in the default bash environment.
- **Rule**: Whenever you need to execute node, bun, npx, bunx, or npm commands, you **must** prefix them with `nix develop -c`. For example:
  - `nix develop -c bun run dev`
  - `nix develop -c bunx drizzle-kit push`
  - `nix develop -c bun add <package>`
