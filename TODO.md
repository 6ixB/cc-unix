# TODO — Modrinth publish

Goal: Make resource pack shippable to Modrinth.

## Now

- [ ] [textures] Redraw computer back side textures
  - [ ] `textures/block/computer_back.png`
  - [ ] `textures/block/computer_back_on.png` (+ `.mcmeta`)
- [ ] [textures] Redraw monitor textures
  - [ ] `textures/block/monitors/normal/*`
  - [ ] `textures/block/monitors/advanced/*`
- [ ] [textures] Redraw floppy disk textures
  - [ ] `textures/item/disk_frame.png`
  - [ ] `textures/item/disk_colour.png`
  - [ ] `textures/item/disk_colour_top.png`

## Next

- [ ] [release] Confirm redraws match Unix design language; consistency check against other Unix textures
- [ ] [release] `npm run format:check` + `npm run build`, in-game check, confirm ZIP has no `*_blockbench.json`

## Later

- [ ] [release] Fill Modrinth project details and disclosures + publish

## Done (prune each release)

- [x] 2026-09-27 — GreenTech MIT notice added to LICENSE; README credits fixed
- [x] 2026-09-27 — Verified GreenTech license (MIT, PirateSee, published 2025-01-16) via Modrinth API
