# Kagwa Wire landing

Static landing page for Kagwa Wire. The first paint is HTML and CSS, and the page still renders if JavaScript is off. A small inline script reveals sections as they enter the viewport. Images and the favicon are local. The lockup lives in `src/logo.ts`. Source brand files are in `src/assets/brand/`.

## Build

From the repo root:

```sh
node --experimental-strip-types apps/landing/build.ts
```

Or, from this directory: `npm run build`

Output: `apps/landing/dist/index.html` and `apps/landing/dist/assets/`

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

The waitlist button is a `mailto:waitlist@kagua.app` link.

## Screenshots

Headless Chrome captures live in `docs/`:

- `docs/desktop-1280x800.png`
- `docs/mobile-390x844.png`
- `docs/desktop-full.png`
- `docs/mobile-full.png`
- `docs/motion-filmstrip.png`
- `docs/motion-hover-button.png`
- `docs/motion-reduced.png`
