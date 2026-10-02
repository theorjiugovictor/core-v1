# CORE brand reference

The brand is already applied in the application. The files in this folder are the original handoff snapshot, not files to copy over the live theme. For the current implementation, see `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`, and `src/components/logo.tsx`.

## Design principles

- Prefer flat surfaces over glass effects and decorative gradient orbs.
- Use the live theme tokens rather than copying colors from this snapshot.

## Colour rules that the tokens can't enforce

1. **Cowrie (`accent`, #FFC53D) is for the primary action** — never behind body copy. Pair it with `accent-foreground` (ink), not white text.
2. **Bright indigo (`ring`, #3B54D6) is interactive** — links, focus rings, selected state. It is not a large fill colour.
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
