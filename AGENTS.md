# Repository Guidelines

## Project Structure & Module Organization
- Root scripts `install.js` and `arg.js` copy framework assets; pass `--path` to choose the target directory (defaults to `../../`).
- Source SASS lives in `src/scss` (base, reset, media queries, vendor overrides). Treat it as the editable core when improving the framework.
- Distributed assets reside in `files/assets/scss`, organized into `core`, `components`, `helpers`, and `themes`; update these when shipping changes to consumers. In `--dep sqhtml` mode, the installer does not use a separate folder: it adjusts destination fonts (Roboto) and variables (`$c3`, `$f1`, `$i1`) on the copied files.
- In `--dep sqhtml2` mode, the installer forces direct installation of `core` SCSS into `../../src/scss/core/` (ignoring `--path`) and applies the same SQHTML overrides to `_variables.scss` and `_fonts.scss`.
- Documentation site files sit in `docs/` with its own `package.json` and `gulpfile.js`; keep sample pages and assets in sync with framework changes.

## Build, Test, and Development Commands
- Install framework assets into a project: `npm run init` (runs `install.js` and copies `files/assets` to the chosen destination). Example with custom path: `npm run init -- --path../../resources/`.
- No default root build or watch tasks are defined; for doc-site updates, use the `docs` workspace tooling (run commands from `docs/`).

## Coding Style & Naming Conventions
- Use 4-space indentation, double quotes, and snake_case identifiers where language permits. Keep declarations grouped in single `const`/`let` statements when possible.
- SASS: place shared variables in `_variables.scss`, mixins in `_mixin.scss`, layout primitives in `_layout.scss`, and animations in `_keyframes.scss`. Prefer clear, utility-style class names and maintain vendor overrides in `_vendor.scss`.
- SISASS follows a desktop-first SASS workflow.
- Each `@include brp(...)` must be applied directly to the corresponding selector, immediately after its base properties. Never nest a breakpoint inside another selector or reuse a single `brp` block to group multiple selectors.
- If an element needs multiple breakpoints, declare them consecutively and keep each one attached to that same selector.
- In `*.sass` and `*.scss`, prioritize value construction through concatenation when composing strings, selectors, property names, prefixes, or similar fragments. Prefer explicit concatenation patterns over alternative forms when both are valid.
- JavaScript: keep small utility modules, avoid side effects in argument parsing, and ensure file paths remain relative-friendly for package consumers.

## Testing Guidelines
- There is no root `npm test` script; validate changes by running `npm run init` into a sample app and checking compiled CSS output. Add targeted checks (e.g., SASS linting or visual diffs) when introducing new components or mixins.
- For doc-site changes, run its local preview/build commands and verify example pages render correctly across breakpoints.

## Documentation Style Guidelines
- Write documentation prose and UI labels in Spanish by default.
  Keep technical identifiers in English when they are code-facing:
  mixin/function names, file names, ids, class names, SCSS keys, and literal API signatures.
- For `docs/components/base/*.html`, use this explicit section order:
  `article` root with id/class, `group_title` block, 1-2 short `description` paragraphs, `Interface` title with mixin signature, parameter table, `Ejemplo` title, and `container_example` with SCSS/CSS/HTML/Resultado blocks.
- `group_title` must contain exactly:
  mixin name and source file in subtitle, `Tipo: Mixin`, and `Versión: 2.x.x` unless a different version is explicitly required.
- In mixins that receive a map (for example `$attr`), document the interface as a map with explicit keys and defaults. Prefer:
  `@mixin name($attr: (...));`
  instead of listing legacy positional parameters.
- If a mixin supports both positional parameters and map input in the same API:
  document both forms explicitly.
  First, show the `Interface` with positional signature.
  Then add `Sintaxis alternativa (map)` with an `@include` example containing map keys and defaults.
  Add a short defaults note when needed (for example: `Valores por defecto: ...`).
- If a mixin supports positional parameters and `map` syntax, document them in two separate parameter tables.
- Parameter tables must include a subtitle that clearly indicates whether they document `Parámetros secuenciales` or `Sintaxis map`.
- In parameter tables, use headers in this exact order:
  `Parámetro` (for positional or mixed APIs) or `Clave` (for map-only APIs), then `Tipo`, `Default`, `Descripción`.
- Wrap every documentation table with class `full` inside a `<div class="container_table">` container. This is required to preserve responsive layout behavior and prevent wide tables from breaking the page on small screens.
- In parameter tables, parameter names must not start with `$`; document them without the SCSS variable prefix.
- In parameter tables, list all supported aliases in the same entry separated by `|` (for example `position | p` or `top | t`).
- In sequential-parameter tables, parameters must appear in the exact signature order because order matters.
- In `map`-syntax tables, document the main key first and then its aliases in the same order used by the mixin implementation.
- In parameter tables for map-based mixins, list map keys directly (`bg`, `color`, etc.), not repeated `$attr` labels.
- If the first positional parameter can also receive a `map` only to enable the alternative `map` syntax, its type in the sequential-parameter table must show only the actual positional type.
- If the first parameter is genuinely of type `map` and not just an entry point for an alternative syntax, document `Map` as its type.
- Each table row description must explain the resulting CSS property or behavior with short, direct wording.
- For every documentation edit, always review the affected Spanish prose for grammar, spelling, accents, punctuation, and natural wording before finishing the task, even if the request is focused on API or structure changes.
- Keep terminology and spelling consistent with existing docs pages:
  `Tipo`, `Versión`, `Interface`, `Sintaxis alternativa (map)`, `Ejemplo`, `Descripción`, `Parámetro`/`Clave`, `Default`.
- Keep examples synchronized with real assets:
  `docs/assets/scss/...`, `docs/assets/css/...`, and the HTML snippet must match the rendered `Resultado`.
- When additional examples are requested on the same documentation page, prefer integrating them into a single SCSS/CSS/HTML/Resultado block (as in `background`), reusing the same `data-src` files whenever possible. Split them into separate blocks only when explicitly requested.
- Do not add extra standalone code blocks between the parameter table and the `Ejemplo` section unless the page explicitly requires an additional subsection.
- When a docs page references a mixin source file, keep naming consistent with the current docs convention (for base mixins: `_base.scscs`).

## Commit & Pull Request Guidelines
- Use concise, imperative commit messages (e.g., `Add grid helpers`, `Fix install path parsing`). Group related edits per commit to keep history readable.
- PRs should describe the change, affected folders (e.g., `src/scss`, `files/assets/scss/core`), manual verification steps, and any docs updates. Include before/after screenshots when altering visual output or doc pages.
