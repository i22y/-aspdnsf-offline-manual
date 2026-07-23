# ASPDotNetStorefront 10 Offline Manual

Offline ASPDotNetStorefront 10 documentation used as the canonical platform reference for RPS ecommerce-store development.

## AI agent setup for RPS work

This repository is readable by any AI coding agent:

- `AGENTS.md` — the single source of truth: instructions any AI agent (OpenAI Codex, Cursor, Gemini CLI, and other `AGENTS.md`-aware tools) follows while working in this repository
- `CLAUDE.md` — Claude Code entry point; imports `AGENTS.md`
- `.github/copilot-instructions.md` — GitHub Copilot entry point; points to `AGENTS.md`
- `install-rps-codex-reference.ps1` — registers this local manual in the user's global Codex instructions

For Claude Code, a user-level skill or a note in `~/.claude/CLAUDE.md` pointing at this checkout applies the same rules globally when working in other RPS repositories.

The installer preserves any existing global Codex instructions and adds or updates only its own managed RPS block.

### Install on Windows

Clone or pull this repository, open PowerShell in the repository folder, and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-rps-codex-reference.ps1
```

The script writes the managed RPS instructions to:

```text
%USERPROFILE%\.codex\AGENTS.md
```

It records the actual local path of this manual. After installation, restart Codex or open a new Codex session.

### Verify the setup

From any RPS development repository, ask Codex:

```text
List the active instructions related to RPS and ASPDNSF, confirm the local manual path, and name the manual files you would search before changing an XML package.
```

For a real documentation check:

```text
Research how ASPDNSF topics and tokens work. Do not change files. Report the exact manual pages consulted.
```

### Update the registered path

If this repository is moved to another folder, run the installer again from its new location. The existing managed block will be replaced without duplicating it.

### Remove the global registration

```powershell
powershell -ExecutionPolicy Bypass -File .\install-rps-codex-reference.ps1 -Uninstall
```

This removes only the managed RPS block and preserves unrelated content in the global `AGENTS.md` file.

## Canonical repository

`https://github.com/RPS-Solutions/aspdnsf-reference-manual`
