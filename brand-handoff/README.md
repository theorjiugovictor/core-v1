# CORE brand handoff — v2

Drop-in replacements for the theme layer. Nothing here touches component logic.

## Files

| File | Goes to | What changed |
| --- | --- | --- |
| `globals.css` | `src/app/globals.css` | Whole token block replaced. New `--success`, radius 0.75 → 0.625rem. |
| `tailwind.config.ts` | `tailwind.config.ts` | Three font families, `success` colour, display type scale, container 1400 → 1200. |
| `layout.tsx` | `src/app/layout.tsx` | Inter → Archivo + IBM Plex Sans + IBM Plex Mono. New title/description. |
| `logo.tsx` | `src/components/logo.tsx` | New wordmark component. Replaces `/logo.svg` in the header. |

## Removed on purpose

- **`.glass` / `.glass-dark`** — frosted panels don't exist in this identity. Surfaces are flat white cards on paper, or flat indigo. Replace usages with `bg-card border border-border`.
- **`.orb-1/2/3` and the `orb-drift` keyframes** — the drifting gradient orbs read as generic AI SaaS and fight the new palette. Delete the elements that use them.
- **`--font-geist-mono`** — no longer loaded; mono is now IBM Plex Mono.

Grep for `glass`, `orb-`, and `font-geist` before deploying.

## Colour rules that the tokens can't enforce

1. **Cowrie (`accent`, #FFC53D) is for one element per screen** — the primary action. Never a background, never a large fill, never behind body copy. Always with `accent-foreground` (ink), never with white text.
2. **Bright indigo (`ring`, #3B54D6) is interactive only** — links, focus rings, selected state. It is not a fill colour.
3. **Green and red are financial, not decorative** — `success` means money in, `destructive` means money out or a real error. Never use them for tags or illustration.
4. **Two colours on screen at a time.** Indigo plus one.

## Type rules

- Archivo (`font-heading`) at **600 or 800 only**, tracking `-0.05em` on display sizes, `-0.025em` on headings. Never regular weight.
- IBM Plex Sans for everything else. Chosen for Yoruba, Igbo, Kinyarwanda and Afrikaans diacritics — do not swap it for a geometric sans.
- All currency, quantities and timestamps use `.tabular` (Plex Mono, tabular-nums) so columns line up.
- Minimum 44px hit targets on mobile.

## Hex reference

```
Indigo          #1E2A6B    brand, headlines, dark surfaces
Bright indigo   #3B54D6    links, focus, selected
Cowrie          #FFC53D    CTA, money in
Ink             #101322    body text
Paper           #F5F6F8    background
Card            #FFFFFF    raised surface
Hairline        #E4E6EB    borders
Muted           #6E7385    labels
Profit          #0E9F6E
Loss            #D6402A
```
