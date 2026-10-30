# Kagua design system

Source of truth for look and feel. The approved mockups are in `docs/internal/canvases/*.dc.html` (dark: Main, Scanning, Stop, CheckMore; light: the *Light files, which import the dark file with `theme="light"`). Read them for exact markup and values. Premium = restraint, depth, bold type, few words.

## Colour tokens
| Token | Dark | Light |
|---|---|---|
| bg | #050605 | #F3F4EE |
| text | #F4F7F1 | #0B0D0C |
| soft | #C9D0C6 | #3A4137 |
| muted | #8F988C | #5B6358 |
| faint | #5E665B / #6F786C | #9AA196 |
| glass (panel) | rgba(255,255,255,.04) | rgba(255,255,255,.8) |
| ring (hairline) | inset 0 0 0 1px rgba(255,255,255,.08) | inset 0 0 0 1px rgba(11,13,12,.08) |
| accent (brand + actions ONLY) | #C6F432 | #C6F432 button; #4A6A00 for text |
| stop | #C42F1F block, ink #FF8A78 | ink #B42A1B |
| check more | amber #FFB020, ink #FFC251 | ink #8A5700 |

**Lime is never a verdict colour.** Bright green reads as "safe", and Kagua never says safe. Verdicts: coral/red = Stop, amber = Check more, neutral = No flags found. Every level also has its own icon (not colour alone).

## Type
Geist (400/500/600/700) for text, Geist Mono for addresses, tags and numbers. Home headline 44/1.02, tracking -0.045em. Stop 96px on its screen, Check more 34px. Body 15-17px. Mono addresses 14-19px.

## Components
- Glass panel: 28px radius outer with 6px padding, 23px inner, hairline ring, soft shadow in dark.
- Primary button: lime, 58px high, 22px radius, inset top highlight, soft lime glow. One per screen.
- Locked "Send anyway": dashed, padlock icon, 30s countdown on Stop.
- Offline pill: "Offline" with a small lime dot; shows on home and checking screens.
- Kagua lens: 260px ring with a conic lime sweep, glow breathing, "3/4 checks" mono counter. Shimmer only while checking is running (it means "working on this phone"). Respect prefers-reduced-motion.
- Address compare: saved vs pasted, differing middle highlighted.
- Chips for tags: PRESSURE, OFF-APP, IMPERSONATION, FAKE SUPPORT in mono, each quoting the triggering text.

## Screens
1. **Check (home)**: headline, address input with network (TRC-20 / EVM), Kagua button, Paste chat / Screenshot / Scan QR, footer "0 B sent off this phone" and frozen-list size. Theme toggle (sun/moon) top right.
2. **Checking**: lens, step bar (Checksum, Network, Frozen list, Look-alike) with real timings.
3. **Stop**: red block with STOP octagon, "Don't send.", saved-vs-pasted compare, lime "Use <contact>'s real address", locked "Send anyway" for 30s.
4. **Check more**: amber chip, "Confirm 3 things before you release.", quoted chat evidence with tags, three tick boxes (own SMS, exact amount, sender name), lime "Paste the SMS, Kagua compares".
Still to design: No flags found (must not look like a green "safe" screen), Can't tell, first-run model download (the only network use, stated clearly), receipt reuse result, saved contacts, evidence pack export, settings (theme, wipe data).

## Accessibility
44px minimum targets, 4.5:1 text contrast, real buttons/labels, screen-reader reads addresses in groups of four, reduced-motion respected, haptic on Stop.
