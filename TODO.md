# TODO — Modrinth publish

Goal: Make resource pack shippable to Modrinth.

## Now

- [ ] [textures] Redraw computer back side textures
  - [ ] `textures/block/computer_back.png`
  - [ ] `textures/block/computer_back_on.png` (+ `.mcmeta`)
- [ ] [textures] Redraw monitor textures
  - [ ] `textures/block/monitors/normal/*`
  - [ ] `textures/block/monitors/advanced/*`
- [x] [textures] Redraw floppy disk textures
  - [x] `textures/item/disk_frame.png`
  - [x] `textures/item/disk_colour.png`

## Next

- [ ] [release] Confirm redraws match Unix design language; consistency check against other Unix textures
- [ ] [release] `npm run format:check` + `npm run build`, in-game check, confirm ZIP has no `*_blockbench.json`

## Later

- [ ] [release] Custom changelog per GitHub release (annotated tag message → release body, keep auto notes)
- [ ] [release] Fill Modrinth project details and disclosures + publish
- [ ] [release] Create gallery images of the resource pack for Modrinth project page

## Done (prune each release)

- [x] 2026-09-27 — GreenTech MIT notice added to LICENSE; README credits fixed
- [x] 2026-09-27 — Verified GreenTech license (MIT, PirateSee, published 2025-01-16) via Modrinth API
