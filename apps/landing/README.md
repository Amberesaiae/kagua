# Kagua landing

Static landing page. The first paint is HTML and CSS only. There is no JavaScript and no third-party request.

## Build

From the repo root:

```sh
node --experimental-strip-types apps/landing/build.ts
```

Or, from this directory: `npm run build`

Output: `apps/landing/dist/index.html`

## Serve

```sh
python3 -m http.server 4173 -d apps/landing/dist
```

## Typecheck

From this directory, after a repo install (`npm ci` at the root):

```sh
npm run typecheck
```

Repo checks (unchanged, run at the root):

```sh
npm test
npx tsc -p packages/core --noEmit
```

## Waitlist

The waitlist button is a `mailto:waitlist@kagua.app` link. To be wired.

## Screenshots

Headless Chrome captures live in `docs/`:

- `docs/desktop-1280x800.png`
- `docs/mobile-390x844.png`
- `docs/desktop-full.png`
- `docs/mobile-full.png`
