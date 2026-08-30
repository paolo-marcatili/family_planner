# Family Planner

A privacy-conscious shared weekly planner for two organizers and their household. The first scaffold establishes a React + TypeScript + Vite frontend, a versioned import contract, and a future authenticated backend boundary.

## Current scope

- Weekly family overview with work-location suggestions and review-oriented planning language
- Explicitly human-reviewed AI proposals (never auto-approved)
- Obfuscated work annotations such as online, listen-only, critical, and fixed
- Future support for events, recurring events, tasks, assignments, and conflict warnings
- JSON file import first; authenticated API import is documented for a future PocketBase-compatible backend
- GitHub Pages deployment workflow for the static frontend

The scaffold does **not** connect to Outlook, Gmail, Aula, or a production backend. Do not add Aula feed URLs, raw calendar data, credentials, or confidential work details to this repository.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite. Validate with:

```bash
npm run check
npm run build
```

## Repository and deployment

The intended repository is private: `https://github.com/paolo-marcatili/family_planner`. The workflow in `.github/workflows/deploy-pages.yml` is ready for GitHub Pages once Pages is enabled for the repository. A future backend must be hosted separately; GitHub Pages cannot provide authentication or shared persistence.

See `docs/architecture.md`, `docs/import-api.md`, `docs/privacy.md`, and `docs/deployment.md` for the planned boundaries.
