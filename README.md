# Bonaventure Reader

A focused reader for Bonaventure's *Collations on the Six Days*.

## Scripts

- `npm run build:data` parses `data/raw/collations-on-the-six-days.htm`
- `npm run dev` starts Vite
- `npm run build` rebuilds data and production assets
- `npm run lint` checks the codebase

## Architecture Notes

The app follows the same broad Tao of React instincts as Neo Summa:

- Group by domain module rather than generic component buckets.
- Keep parser/data shaping outside React components.
- Use named functional components.
- Keep presentational pieces small and explicit.
- Keep route state in the browser URL so sections are shareable.
