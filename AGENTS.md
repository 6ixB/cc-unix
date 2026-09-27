# AGENTS.md — Unix CC:Tweaked Resource Pack

Minecraft Java resource pack. Reskins `computercraft` namespace (CC:Tweaked).
Single builder `build.ts` (TypeScript ESM, Node + archiver). Output `out/Unix.zip`.
No runtime code, no tests beyond format + build + in-game load.

## Setup

- Requires Node.js >= 22.6.0 (`--experimental-strip-types` flag). Node >= 22.18 runs flagless.
- Install deps: `npm install`
- Local Node < 22.6 cannot run `npm run build` as-is. Upgrade first.

## Commands

| Action       | Command                          |
| ------------ | -------------------------------- |
| Install      | `npm install`                    |
| Build pack   | `npm run build` → `out/Unix.zip` |
| Clean output | `npm run clean`                  |
| Format write | `npm run format`                 |
| Format check | `npm run format:check`           |

Run `npm run format` before every edit. `npm run format:check` must pass before commit.

## Build pipeline (`build.ts`)

- Copies `assets/`, `pack.mcmeta`, `pack.png`, `LICENSE` into `out/`.
- Skips `EXCLUDED_FILES` (`.gitignore`, `README.md`, `build.ts`, `tsconfig.json`, `package.json`, `package-lock.json`) and dirs (`out`, `.git`, `node_modules`).
- Deletes all `*_blockbench.json` from `out/` before zipping.
- Zips with max compression, then removes intermediates so only `out/Unix.zip` remains.
- `LICENSE` ships at ZIP root intentionally. Never exclude it.
- `tsconfig.json` covers `build.ts` only (`strict`, `NodeNext`, `noEmit`).

## Blockbench workflow

- `*_blockbench.json` files (mostly `monitor_*`, `wired_modem_full_*`, `redstone_relay`) are authoring sources. Stripped automatically on build.
- Keep paired files in sync when editing models: `foo.json` + `foo_blockbench.json`.
- Never reference `_blockbench` from `blockstates/` or other models.
- Never commit `*.bbmodel` or `.blockbench/` (gitignored).

## Asset conventions

- Models: `assets/computercraft/models/block/*.json`, `models/item/cable.json|disk.json`.
- Textures: `textures/block/` per-face PNG (+ `monitors/{normal,advanced}/`), `textures/gui/` terminal borders/sidebars/turtle/pocket GUIs, `textures/item/` pocket computers/disks/printed media.
- Animation: sibling `.mcmeta` next to blinking/light PNGs (`computer_*_blink`, `cable_core`, borders, sidebars, pocket bottoms). Keep PNG + `.mcmeta` together.
- Naming: `computer_<normal|advanced|command>_<off|on|blinking>`, `turtle_<normal|advanced>`, `monitor_<normal|advanced>_<orientation|item>`, `wired_modem_*`, `wireless_modem_*`, `printer_*`, `speaker`, `redstone_relay`, `cable_*`.
- Model texture refs use `computercraft:block/<name>`. Parents usually `minecraft:block/orientable`.
- `blockstates/cable.json` is multipart (cable arms + modem states). Edit carefully.
- `lang/en_us.json` holds 2 disk keys only. Add keys only for renamed items.
- `pack.mcmeta`: `pack_format 34`, `supported_formats [3,34]` (MC 1.21–1.21.1). Bump only on MC upgrade.

## Validation

1. `npm run format:check`
2. `npm run build`
3. Load `out/Unix.zip` in-game with CC:Tweaked installed, check touched blocks/items/GUIs.
4. Confirm no `*_blockbench.json` inside ZIP.

## Release

- Tags trigger `.github/workflows/release.yml` (`v*-mc*` pattern).
- Tag format: `v<pack>-mc<mc>` (e.g. `git tag v1.0.0-mc1.21.1`). Tag uses `-mc` because `+` invalid in tag filters.
- CI builds then renames to Modrinth convention `out/unix-<pack>+mc<mc>.zip`.
- Keep `package.json` version in sync with tag pack version.

## License / attribution

- CC-BY-4.0. See `LICENSE`.
- Credit 6ixB on share/adapt, even commercially.
- Inspiration: ComputerCraft GreenTech by PirateSee. Bundled textures: Create ComputerCraft by End_Rage. Preserve attribution when touching those files.

## Git workflow

- `out/`, `node_modules/`, `*.bbmodel`, `.blockbench/` gitignored. Never force-add.
- Branch, edit under `assets/computercraft/`, format, build, test in-game, open PR against `6ixB/unix-cct-resource-pack`.
- Pre-commit hook (husky + lint-staged) auto-runs `prettier --write` on staged `*.{ts,json,md,yml,yaml,mcmeta}`. Do not bypass with `--no-verify`.
