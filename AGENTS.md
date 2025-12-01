# Repository Guidelines

## Project Structure & Module Organization
- Root scripts `install.js` and `arg.js` copy framework assets; pass `--path` to choose the target directory (defaults to `../../`). 
- Source SASS lives in `src/scss` (base, reset, media queries, vendor overrides). Treat it as the editable core when improving the framework.
- Distributed assets reside in `files/assets/scss`, organized into `core`, `components`, `helpers`, and `themes`; update these when shipping changes to consumers. El modo `--dep sqhtml` no usa carpeta aparte: el instalador ajusta en destino fuentes (Roboto) y variables ($c3, $f1, $i1) sobre los archivos copiados.
- El modo `--dep sqhtml2` fuerza la instalación directa de los SCSS de `core` en `../../src/scss/core/` (ignorando `--path`) y aplica los mismos overrides de SQHTML sobre `_variables.scss` y `_fonts.scss`.
- Documentation site files sit in `docs/` with its own `package.json` and `gulpfile.js`; keep sample pages and assets in sync with framework changes.

## Build, Test, and Development Commands
- Install framework assets into a project: `npm run init` (runs `install.js` and copies `files/assets` to the chosen destination). Example with custom path: `npm run init -- --path../../resources/`.
- No default root build or watch tasks are defined; for doc-site updates, use the `docs` workspace tooling (run commands from `docs/`).

## Coding Style & Naming Conventions
- Use 4-space indentation, double quotes, and snake_case identifiers where language permits. Keep declarations grouped in single `const`/`let` statements when possible.
- SASS: place shared variables in `_variables.scss`, mixins in `_mixin.scss`, layout primitives in `_layout.scss`, and animations in `_keyframes.scss`. Prefer clear, utility-style class names and maintain vendor overrides in `_vendor.scss`.
- JavaScript: keep small utility modules, avoid side effects in argument parsing, and ensure file paths remain relative-friendly for package consumers.

## Testing Guidelines
- There is no root `npm test` script; validate changes by running `npm run init` into a sample app and checking compiled CSS output. Add targeted checks (e.g., SASS linting or visual diffs) when introducing new components or mixins.
- For doc-site changes, run its local preview/build commands and verify example pages render correctly across breakpoints.

## Commit & Pull Request Guidelines
- Use concise, imperative commit messages (e.g., `Add grid helpers`, `Fix install path parsing`). Group related edits per commit to keep history readable.
- PRs should describe the change, affected folders (e.g., `src/scss`, `files/assets/scss/core`), manual verification steps, and any docs updates. Include before/after screenshots when altering visual output or doc pages.
