# Repository Guidelines

## Project Structure & Module Organization
- Root scripts `install.js` and `arg.js` copy framework assets; pass `--path` to choose the target directory (defaults to `../../`).
- Source SASS lives in `src` (base, reset, media queries, vendor overrides). Treat it as the editable core when improving the framework.
- Distributed assets reside in `files/assets/scss`, organized into `core`, `components`, `helpers`, and `themes`; update these when shipping changes to consumers. In `--dep sqhtml` mode, the installer does not use a separate folder: it adjusts destination fonts (Roboto) and variables (`$c3`, `$f1`, `$i1`) on the copied files.
- In `--dep sqhtml2` mode, the installer forces direct installation of `core` SCSS into `../../src/core/` (ignoring `--path`) and applies the same SQHTML overrides to `_variables.scss` and `_fonts.scss`.
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
- Treat `docs/` as the main documentation site and `doc/` as non-canonical unless a task explicitly uses it.
- Keep source and generated documentation assets in sync when changing documentation content.
- Use `docs/index.html` as the documentation entry point, with `docs/pages/`, `docs/components/`, `docs/assets/scss/`, `docs/assets/css/`, `docs/assets/js/`, and `docs/assets/json/` as the main documentation areas.
- Preserve the current documentation naming conventions and page structure when editing component pages.
- When a new documentation category is added in `docs/pages/base.html`, update the corresponding menu in `docs/components/global/menu.html` and any related index or classification blocks if the new category exposes new resources.
- Keep documentation breadcrumbs available on every docs page except the home page:
  - Each page JSON can define a manual `breadcrumb` array before `components`.
  - Use the simple item structure `{ "label": "src", "url": "../pages/base.html#src" }`; `url` is optional and the last item usually omits it because it represents the current file or page.
  - If `breadcrumb` is missing, `docs/assets/js/core/breadcrumb.js` calculates a fallback route from the current URL.
  - Each non-home page script in `docs/assets/js/pages/` must import `init_page_breadcrumb` and call it with the page JSON URL after `contentLoad`.
  - For pages that document source files, prefer a manual source-path breadcrumb such as `src / _base.scss` instead of the HTML page path.
- Keep the global documentation search synchronized whenever articles, reference pages, sections, or component fragments change:
  - The search index is generated at `docs/assets/json/search_index.json` by the `search_index` Gulp task.
  - The generator scans every `docs/pages/**/*.html` file and only indexes a page when there is a matching JSON file in `docs/assets/json/` with the same basename. For example, `docs/pages/articles/project_structure.html` requires `docs/assets/json/project_structure.json`.
  - Each page JSON must expose a `components` array whose entries point to real component files through `url`. Each entry must define a stable `id` or `node`; that value becomes the search anchor and must match the rendered section or article target used by the page.
  - Search titles and categories are read from each component's `group_title` block. Keep the `subtitle`, `Tipo`, and visible Spanish prose updated because this text is what users will find.
  - Do not edit `docs/assets/json/search_index.json` manually. Regenerate it from `docs/` with `npm exec gulp search_index` after adding, deleting, renaming, or moving pages, JSON files, component entries, anchors, titles, categories, or searchable prose.
  - After regenerating the index, run `npm exec gulp jsonlint` from `docs/` to catch malformed JSON. If the documentation package defines a `test` script, also run `npm run test`.
  - When running the docs watcher, verify that changes to `docs/pages/**/*.html`, `docs/components/**/*.html`, and `docs/assets/json/*.json` refresh the search index. If the watcher is not running, regenerate the index explicitly before finishing.
  - Validate at least one representative query in the browser or by inspecting `docs/assets/json/search_index.json` when the change affects discoverability. Confirm that the result opens the correct page and hash anchor, especially for nested paths under `docs/pages/articles/`.
- Prefer updating both SCSS source and compiled CSS when a documentation style change is intentional.
- Rebuild the relevant documentation assets after editing SCSS, SVG, or JSON sources, and validate layout changes in the browser.
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
- Do not introduce component-specific theme logic into unrelated style partials.

### Uso De `TabPanel` En Ejemplos

- Para convertir un ejemplo convencional existente, ejecuta desde la raíz:
  `npm run tab_panel -- --file components/base/nombre.html`.
  También se puede ejecutar desde `docs/` con el mismo comando. El script reorganiza
  el primer `container_example`, genera un id `<archivo>_example_tabs` e inicializa
  todos los paneles desde el script de página correspondiente. Usa `--index 2` si la
  página tiene varios ejemplos, `--id otro_id` para personalizar el id y `--dry-run`
  para validar sin escribir. Consulta todas las opciones con
  `npm run tab_panel -- --help`.
- Usa `docs/assets/js/libraries/tab_panel.min.js` para agrupar las vistas de un ejemplo cuando deban presentarse como pestañas. En los ejemplos completos, conserva este orden: `Resultado`, `SCSS`, `CSS generado` y `HTML`; deja `Resultado` como pestaña inicial salvo que la solicitud indique otra cosa.
- Importa la clase como módulo desde el script de la página correspondiente:
  `import { TabPanel } from "../libraries/tab_panel.min.js";`.
- Los componentes de documentación se insertan de forma asíncrona mediante `contentLoad`. Crea e inicializa cada instancia de `TabPanel` únicamente después de completar `await contentLoad(...)`, cuando el nodo raíz ya exista en el DOM:

  ```js
  await contentLoad({
      url: url_json_page
  });

  const example_tabs = new TabPanel("#example_tabs");

  example_tabs.init();
  ```

- Usa un `id` único en la página para cada raíz. La estructura mínima válida debe incluir:
  - una raíz con `data-tab-panel`;
  - exactamente un listado propio con `data-tab-panel-list`;
  - al menos dos botones propios con `data-tab-panel-tab="tab_id"`;
  - la misma cantidad de paneles propios con `data-tab-panel-panel="tab_id"`.
- Cada `tab_id` debe ser una cadena no vacía, única dentro de la instancia y debe coincidir exactamente entre un botón y su panel. Todos los botones deben estar contenidos en el único `data-tab-panel-list` de la instancia.
- Usa los atributos `data-*` para el comportamiento y las clases `tab_panel`, `tab_panel_list`, `tab_panel_tab` y `tab_panel_panel` para la presentación. Sigue esta estructura:

  ```html
  <div
      id="example_tabs"
      class="container_example tab_panel"
      data-tab-panel
      data-active-tab="result"
  >
      <div class="tab_panel_list" data-tab-panel-list>
          <button class="tab_panel_tab" data-tab-panel-tab="result">Resultado</button>
          <button class="tab_panel_tab" data-tab-panel-tab="scss">SCSS</button>
      </div>

      <div class="tab_panel_panel" data-tab-panel-panel="result">
          <div class="result">...</div>
      </div>

      <div class="tab_panel_panel" data-tab-panel-panel="scss">
          <pre class="language-scss" data-src="../assets/scss/example.scss"></pre>
      </div>
  </div>
  ```

- Define la pestaña inicial con `data-active-tab` en la raíz cuando el valor forme parte del marcado. La prioridad aplicada por la librería es: opción JavaScript `active_tab`, atributo `data-active-tab` y, como fallback, la primera pestaña válida.
- No agregues `hidden`, roles ARIA, IDs de relación ni estados activos manualmente al marcado inicial. Antes de una inicialización válida, todos los paneles deben permanecer visibles como fallback progresivo. Al ejecutar `init()`, la librería administra:
  - `is_initialized` en la raíz;
  - `is_active` en la pestaña y el panel seleccionados;
  - `role="tablist"`, `role="tab"` y `role="tabpanel"`;
  - `aria-controls`, `aria-selected` y `aria-labelledby`;
  - IDs internos únicos, `hidden` en paneles inactivos y `type="button"` cuando el botón no lo define.
- Mantén los bloques de código dentro de su panel. Para SCSS y CSS reales, conserva `pre.language-*` con `data-src`; Prism puede cargar esos archivos aunque el panel quede oculto después de inicializar `TabPanel`. El HTML mostrado y el contenido de `Resultado` deben continuar sincronizados.
- Mantén los estilos compartidos de las pestañas en `docs/assets/scss/components/_documentationpage.scss`, dentro de `.documentationpage`. Usa `is_active` para el estado visual y conserva desplazamiento horizontal en `tab_panel_list` para evitar desbordamiento en pantallas estrechas. No agregues estos estilos a un partial de tema no relacionado.
- Si una página contiene varias raíces, crea una instancia independiente por cada raíz. Los nodos pertenecen a la raíz `data-tab-panel` más cercana; no reutilices botones o paneles entre instancias.
- Si el contenido de una instancia va a retirarse o reemplazarse después de inicializarse, conserva su referencia y llama `destroy()` antes de eliminarlo. Esto cancela los listeners y restaura los atributos administrados por la librería.
- Una estructura inválida deja la instancia con estado `invalid` y mantiene los paneles visibles. Durante la validación, confirma que `get_status()` devuelva `init`, que solo la pestaña inicial tenga `aria-selected="true"`, que los demás paneles tengan `hidden` y que los recursos `data-src` alcancen el estado `loaded`.
- Después de modificar el SCSS del panel, ejecuta `npm exec gulp scss` desde `docs/` y conserva actualizado `docs/assets/css/main.css`. Si la compilación afecta CSS con SVG pendiente de procesar, ejecuta también `npm exec gulp process_svg`. Ejecuta `npm exec gulp lint`; si cambian etiquetas o prosa indexable, regenera además el buscador con `npm exec gulp search_index` y valida con `npm exec gulp jsonlint`.

## Checklist Para Crear Una `pages/` Desde Cero
Antes de construir una página nueva de la documentación, sigue este flujo:

1. Identifica el tipo de página.
2. Confirma la clasificación con el usuario si hay más de una opción posible.
3. Verifica qué archivos deben existir o actualizarse.
4. Revisa si la nueva página necesita assets de ejemplo y estilos compilados.
5. Comprueba si la navegación, el breadcrumb, el buscador global o el hash routing deben reconocerla.
6. Ajusta los textos en español y valida que el contenido coincida con los assets reales.
7. Si la página debe mostrar una ruta distinta a la calculada por URL, define `breadcrumb` en su JSON con la estructura simple de items.
8. Si la página o sección debe aparecer en el buscador, crea o actualiza su JSON homónimo en `docs/assets/json/`, registra sus componentes con `id` o `node` estable, y regenera `docs/assets/json/search_index.json` con `npm exec gulp search_index` desde `docs/`.
9. Ejecuta la verificación correspondiente del sitio de documentación.

### Clasificación De Páginas

| Clasificación | Cuándo usarla | Archivos mínimos |
| --- | --- | --- |
| `portada` | Portada general del sitio de documentación. | `docs/index.html`, `docs/assets/js/pages/home.js`, `docs/assets/json/home.json`, componentes de `docs/components/home/` |
| `pagina_referencia` | Página de referencia para un archivo fuente como `base`, `vendor`, `mediaqueries` o `reset`. | `docs/pages/*.html`, `docs/assets/js/pages/*.js`, `docs/assets/json/*.json`, componentes de `docs/components/*/` |
| `nueva_seccion_referencia` | Nueva sección dentro de una página de referencia existente. | `docs/pages/*.html`, `docs/assets/json/*.json`, `docs/components/...`, y estilos o ejemplos asociados si aplica |
| `componente_solo` | Fragmento reutilizable que no necesita una página completa. | `docs/components/...` y, si corresponde, assets de ejemplo sincronizados |
| `recurso_compartido` | Recurso compartido por varias páginas, como plantillas, headers, menús o cargadores. | `docs/components/global/`, `docs/templates/`, `docs/assets/js/core/` o `docs/assets/js/components/` según corresponda |

### Preguntas Que Debo Hacer Antes De Empezar

Si la solicitud no aclara lo suficiente el alcance, pregunta primero. Si existe ambigüedad sobre clasificación, menú, reutilización o assets, debo preguntar siempre antes de decidir.

1. ¿Qué tipo de página quieres construir: `portada`, `pagina_referencia`, `nueva_seccion_referencia`, `componente_solo` o `recurso_compartido`?
2. ¿La nueva pieza debe vivir en `docs/pages/` o solo en `docs/components/`?
3. ¿Debe tener su propio `docs/assets/js/pages/*.js` y su propio `docs/assets/json/*.json`?
4. ¿Hay que agregar una categoría nueva o reutilizar una existente en `docs/components/global/menu.html`?
5. ¿La pieza necesita ejemplos reales con `docs/assets/scss/...`, `docs/assets/css/...` y HTML de resultado?
6. ¿Debo mantener la estructura visual y de secciones de una página existente o crear una variante nueva?
7. ¿Quieres fijar alguna asunción explícita antes de que implemente la página?

## Commit & Pull Request Guidelines
- Use concise, imperative commit messages (e.g., `Add grid helpers`, `Fix install path parsing`). Group related edits per commit to keep history readable.
- PRs should describe the change, affected folders (e.g., `src`, `files/assets/scss/core`), manual verification steps, and any docs updates. Include before/after screenshots when altering visual output or doc pages.
