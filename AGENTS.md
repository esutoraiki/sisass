# Guía Del Repositorio

## Evita La Sobreingeniería

Prefiere siempre el cambio correcto más pequeño y simple:
- Mantén los cambios localizados y minimiza el diff.
- Sigue los patrones existentes antes de introducir patrones nuevos.
- No refactorices código no relacionado.
- No agregues abstracciones, envoltorios, helpers, interfaces, configuración ni archivos nuevos salvo que resuelvan una necesidad concreta actual.
- No diseñes para requisitos futuros hipotéticos.
- No agregues comportamientos ni rutas de respaldo que no se hayan solicitado.

## Estructura Del Proyecto Y Organización De Módulos
- Los scripts raíz `install.js` y `arg.js` copian los recursos del marco de trabajo; pasa `--path` para elegir el directorio de destino (por defecto usa `../../`).
- El SASS fuente vive en `src` (base, reset, media queries y ajustes de proveedor). Trátalo como el núcleo editable al mejorar el marco de trabajo.
- Los recursos distribuidos residen en `files/assets/scss`, organizados en `core`, `components`, `helpers` y `themes`; actualízalos cuando publiques cambios para consumidores. En modo `--dep sqhtml`, el instalador no usa una carpeta separada: ajusta las fuentes de destino (Roboto) y las variables (`$c3`, `$f1`, `$i1`) en los archivos copiados.
- En modo `--dep sqhtml2`, el instalador fuerza la instalación directa del SCSS de `core` en `../../src/core/` (ignorando `--path`) y aplica los mismos ajustes de SQHTML a `_variables.scss` y `_fonts.scss`.
- Los archivos del sitio de documentación están en `docs/`, con su propio `package.json` y `gulpfile.js`; mantén las páginas de ejemplo y los recursos sincronizados con los cambios del marco de trabajo.

## Comandos De Compilación, Pruebas Y Desarrollo
- Instala los recursos del marco de trabajo en un proyecto con `npm run init` (ejecuta `install.js` y copia `files/assets` al destino elegido). Ejemplo con ruta personalizada: `npm run init -- --path../../resources/`.
- No hay tareas raíz predeterminadas de compilación o vigilancia; para actualizaciones del sitio de documentación, usa las herramientas del espacio de trabajo `docs` (ejecuta los comandos desde `docs/`).

## Estilo De Código Y Convenciones De Nombres
- Usa indentación de 4 espacios, comillas dobles e identificadores en `snake_case` cuando el lenguaje lo permita. Mantén las declaraciones agrupadas en una sola sentencia `const`/`let` cuando sea posible.
- SASS: coloca las variables compartidas en `_variables.scss`, los mixins en `_mixin.scss`, las primitivas de composición en `_layout.scss` y las animaciones en `_keyframes.scss`. Prefiere nombres de clase claros y de estilo utilitario, y conserva los ajustes de proveedor en `_vendor.scss`.
- SISASS sigue un flujo SASS pensado primero para escritorio.
- Cada `@include brp(...)` debe aplicarse directamente al selector correspondiente, inmediatamente después de sus propiedades base. Nunca anides un breakpoint dentro de otro selector ni reutilices un único bloque `brp` para agrupar varios selectores.
- Si un elemento necesita varios breakpoints, decláralos consecutivamente y mantén cada uno asociado a ese mismo selector.
- En `*.sass` y `*.scss`, prioriza la construcción de valores mediante concatenación al componer strings, selectores, nombres de propiedades, prefijos o fragmentos similares. Prefiere patrones de concatenación explícitos sobre formas alternativas cuando ambas sean válidas.
- JavaScript: mantén módulos utilitarios pequeños, evita efectos secundarios en el análisis de argumentos y asegúrate de que las rutas de archivos sigan siendo amigables para consumidores del paquete.

## Guías De Pruebas
- No hay un script raíz `npm test`; valida los cambios ejecutando `npm run init` en una app de ejemplo y revisando la salida CSS compilada. Agrega verificaciones puntuales (por ejemplo, revisión lint de SASS o diferencias visuales) cuando introduzcas componentes o mixins nuevos.
- Para cambios del sitio de documentación, ejecuta sus comandos locales de vista previa/build y verifica que las páginas de ejemplo se rendericen correctamente en los distintos breakpoints.

## Guías De Estilo De La Documentación
- Escribe la prosa de documentación y las etiquetas de UI en español por defecto.
  Mantén en inglés los identificadores técnicos cuando estén orientados al código:
  nombres de mixins/funciones, nombres de archivos, ids, nombres de clases, claves SCSS y firmas literales de API.
- En artículos de documentación, usa la etiqueta `b` para mini código en línea como comandos, rutas,
  nombres de paquetes, flags, variables e identificadores cortos. Reserva la etiqueta `code` para bloques
  de código completos o líneas completas de código que serán procesadas por `docs/assets/js/libraries/prism.js`.
- Trata `docs/` como el sitio principal de documentación y `doc/` como no canónico salvo que una tarea lo use explícitamente.
- Mantén sincronizados los recursos fuente y generados de la documentación al cambiar contenido de documentación.
- Usa `docs/index.html` como punto de entrada de la documentación, con `docs/pages/`, `docs/components/`, `docs/assets/scss/`, `docs/assets/css/`, `docs/assets/js/` y `docs/assets/json/` como áreas principales de documentación.
- Conserva las convenciones actuales de nombres y la estructura de páginas de la documentación al editar páginas de componentes.
- Cuando se agregue una categoría nueva de documentación en `docs/pages/base.html`, actualiza el menú correspondiente en `docs/components/global/menu.html` y cualquier bloque relacionado de índice o clasificación si la categoría nueva expone recursos nuevos.
- Mantén las migas de pan de documentación disponibles en todas las páginas de documentación excepto la página de inicio:
  - Cada JSON de página puede definir un array manual `breadcrumb` antes de `components`.
  - Usa la estructura simple de ítem `{ "label": "src", "url": "../pages/base.html#src" }`; `url` es opcional y el último ítem suele omitirlo porque representa el archivo o la página actual.
  - Si falta `breadcrumb`, `docs/assets/js/core/breadcrumb.js` calcula una ruta de respaldo desde la URL actual.
  - Cada script de página que no sea de inicio en `docs/assets/js/pages/` debe importar `init_page_breadcrumb` y llamarlo con la URL del JSON de página después de `contentLoad`.
  - Para páginas que documentan archivos fuente, prefiere un breadcrumb manual de ruta fuente como `src / _base.scss` en lugar de la ruta de la página HTML.
- Mantén sincronizado el buscador global de documentación siempre que cambien artículos, páginas de referencia, secciones o fragmentos de componentes:
  - El índice de búsqueda se genera en `docs/assets/json/search_index.json` mediante la tarea Gulp `search_index`.
  - El generador analiza cada archivo `docs/pages/**/*.html` y solo indexa una página cuando existe un archivo JSON coincidente en `docs/assets/json/` con el mismo nombre base. Por ejemplo, `docs/pages/articles/project_structure.html` requiere `docs/assets/json/project_structure.json`.
  - Cada JSON de página debe exponer un array `components` cuyas entradas apunten a archivos reales de componentes mediante `url`. Cada entrada debe definir un `id` o `node` estable; ese valor se convierte en el ancla de búsqueda y debe coincidir con la sección renderizada o el objetivo del artículo usado por la página.
  - Los títulos y categorías de búsqueda se leen desde el bloque `group_title` de cada componente. Mantén actualizados el `subtitle`, `Tipo` y la prosa visible en español porque ese texto es lo que encontrarán los usuarios.
  - No edites `docs/assets/json/search_index.json` manualmente. Regenéralo desde `docs/` con `npm exec gulp search_index` después de agregar, borrar, renombrar o mover páginas, archivos JSON, entradas de componentes, anclas, títulos, categorías o prosa indexable.
  - Después de regenerar el índice, ejecuta `npm exec gulp jsonlint` desde `docs/` para detectar JSON mal formado. Si el paquete de documentación define un script `test`, ejecuta también `npm run test`.
  - Cuando ejecutes el vigilante de documentación, verifica que los cambios en `docs/pages/**/*.html`, `docs/components/**/*.html` y `docs/assets/json/*.json` refresquen el índice de búsqueda. Si el vigilante no está corriendo, regenera el índice explícitamente antes de terminar.
  - Valida al menos una consulta representativa en el navegador o inspeccionando `docs/assets/json/search_index.json` cuando el cambio afecte la descubribilidad. Confirma que el resultado abra la página correcta y el ancla hash correcta, especialmente para rutas anidadas bajo `docs/pages/articles/`.
- Prefiere actualizar tanto el SCSS fuente como el CSS compilado cuando un cambio de estilo de documentación sea intencional.
- Reconstruye los recursos relevantes de documentación después de editar fuentes SCSS, SVG o JSON, y valida los cambios de composición en el navegador.
- Para `docs/components/base/*.html`, usa este orden explícito de secciones:
  raíz `article` con id/class, bloque `group_title`, 1-2 párrafos cortos `description`, título `Interface` con firma del mixin, tabla de parámetros, título `Ejemplo` y `container_example` con bloques SCSS/CSS/HTML/Resultado.
- `group_title` debe contener exactamente:
  nombre del mixin y archivo fuente en el subtitle, `Tipo: Mixin` y `Versión: 2.x.x` salvo que se requiera explícitamente una versión diferente.
- En mixins que reciben un map (por ejemplo `$attr`), documenta la interface como un map con claves y valores por defecto explícitos. Prefiere:
  `@mixin name($attr: (...));`
  en lugar de listar parámetros posicionales heredados.
- Cuando un mixin basado en map delegue parte de su configuración a otro mixin basado en map, encapsula esas opciones en una clave propia con un map anidado y pasa ese map al mixin delegado. No repitas sus claves en el nivel principal del mixin contenedor.
- Normaliza el map anidado antes de delegarlo: conserva los valores por defecto que necesita el mixin contenedor y acepta las mismas claves y alias públicos del mixin delegado. Por ejemplo, si `button_simple` usa `tf`, recibe `tf: (...)`, construye `$tf_attr` desde ese submapa y ejecuta `@include tf($tf_attr)`.
- Si un mixin admite parámetros posicionales y entrada map en la misma API:
  documenta ambas formas explícitamente.
  Primero, muestra la `Interface` con la firma posicional.
  Luego agrega `Sintaxis alternativa (map)` con un ejemplo `@include` que contenga claves map y valores por defecto.
  Agrega una nota breve de valores por defecto cuando sea necesario (por ejemplo: `Valores por defecto: ...`).
- Si un mixin admite parámetros posicionales y sintaxis `map`, documéntalos en dos tablas de parámetros separadas.
- Las tablas de parámetros deben incluir un subtítulo que indique claramente si documentan `Parámetros secuenciales` o `Sintaxis map`.
- En las tablas de parámetros, usa encabezados en este orden exacto:
  `Parámetro` (para APIs posicionales o mixtas) o `Clave` (para APIs solo map), luego `Tipo`, `Default`, `Descripción`.
- Envuelve cada tabla de documentación con clase `full` dentro de un contenedor `<div class="container_table">`. Esto es necesario para conservar el comportamiento adaptable de la composición y evitar que tablas anchas rompan la página en pantallas pequeñas.
- En las tablas de parámetros, los nombres de parámetros no deben comenzar con `$`; documéntalos sin el prefijo de variable SCSS.
- En las tablas de parámetros, lista todos los alias soportados en la misma entrada separados por `|` (por ejemplo `position | p` o `top | t`).
- En las tablas de parámetros secuenciales, los parámetros deben aparecer en el orden exacto de la firma porque el orden importa.
- En tablas de sintaxis `map`, documenta primero la clave principal y luego sus alias en el mismo orden usado por la implementación del mixin.
- En tablas de parámetros para mixins basados en map, lista directamente las claves del map (`bg`, `color`, etc.), no etiquetas repetidas `$attr`.
- Si el primer parámetro posicional también puede recibir un `map` solo para habilitar la sintaxis alternativa `map`, su tipo en la tabla de parámetros secuenciales debe mostrar solo el tipo posicional real.
- Si el primer parámetro es genuinamente de tipo `map` y no solo una entrada para una sintaxis alternativa, documenta `Map` como su tipo.
- Cada descripción de fila de tabla debe explicar la propiedad CSS o el comportamiento resultante con redacción breve y directa.
- En cada edición de documentación, revisa siempre la prosa en español afectada para corregir gramática, ortografía, acentos, puntuación y naturalidad antes de terminar la tarea, incluso si la solicitud se enfoca en API o estructura.
- Mantén la terminología y la ortografía consistentes con las páginas existentes de docs:
  `Tipo`, `Versión`, `Interface`, `Sintaxis alternativa (map)`, `Ejemplo`, `Descripción`, `Parámetro`/`Clave`, `Default`.
- Mantén los ejemplos sincronizados con recursos reales:
  `docs/assets/scss/...`, `docs/assets/css/...` y el fragmento HTML debe coincidir con el `Resultado` renderizado.
- Cuando se soliciten ejemplos adicionales en la misma página de documentación, prefiere integrarlos en un único bloque SCSS/CSS/HTML/Resultado (como en `background`), reutilizando los mismos archivos `data-src` siempre que sea posible. Sepáralos en bloques distintos solo cuando se solicite explícitamente.
- No agregues bloques de código independientes adicionales entre la tabla de parámetros y la sección `Ejemplo` salvo que la página requiera explícitamente una subsección adicional.
- Cuando una página de docs referencie un archivo fuente de mixin, mantén el nombre consistente con la convención actual de docs (para mixins base: `_base.scscs`).
- No introduzcas lógica de tema específica de un componente en partials de estilo no relacionados.

### Menú De La Página Actual

- Usa `docs/assets/js/core/page_menu.js` para construir el submenú de la página actual a partir de encabezados `h2` y `h3` seleccionados explícitamente. Los estilos compartidos viven en `docs/assets/scss/components/_page_menu.scss` y se cargan desde `docs/assets/scss/main.scss`; no dupliques esta lógica ni estos estilos por página.
- Para habilitar el submenú, agrega el siguiente `aside` dentro de `.container_main.layout_1`, antes de `#main_content`:

  ```html
  <aside id="sidebar_menu" class="sidebar_menu a4" hidden></aside>
  ```

- Marca únicamente los encabezados que deban aparecer con `data-page-menu-item`. Cada encabezado marcado debe tener un `id` explícito, estable y único en el documento:

  ```html
  <h2 id="section_name" data-page-menu-item>Nombre de la sección</h2>
  <h3 id="subsection_name" data-page-menu-item>Nombre de la subsección</h3>
  ```

- Usa `data-page-menu-label` cuando el texto visible del enlace deba ser más corto o diferente del encabezado. Si no se define, el menú usa el contenido textual del encabezado.
- Un `h3` marcado se anida bajo el último `h2` marcado y válido que lo preceda. No marques un `h3` sin un `h2` anterior. El generador omite y reporta en consola encabezados sin `id`, identificadores duplicados, etiquetas vacías y `h3` huérfanos.
- Los encabezados dentro de `[data-tab-panel-panel]` se excluyen automáticamente, aunque tengan `data-page-menu-item`. No los uses para construir el menú.
- Importa el inicializador desde el script de la página:

  ```js
  import { init_page_menu } from "../core/page_menu.js";
  ```

- Ejecuta `init_page_menu()` después de completar `await contentLoad(...)` y después de inicializar los componentes de la página que puedan afectar el contenido. El marcado debe existir en el DOM antes de generar el menú:

  ```js
  await contentLoad({
      url: url_json_page
  });

  init_page_menu();
  ```

- Mantén `hidden` en el `aside` inicial. El módulo lo muestra cuando encuentra entradas válidas y lo conserva oculto cuando la página no tiene encabezados seleccionados.
- No construyas los enlaces manualmente con rutas relativas. El módulo conserva `window.location.pathname` y `window.location.search` antes de agregar el hash para evitar que la etiqueta `base` de las páginas redirija la navegación hacia `docs/assets/`.
- El menú es fijo en escritorio, colapsable en pantallas estrechas y se oculta al imprimir. Al modificar sus estilos, ejecuta `npm exec gulp scss` desde `docs/` y conserva actualizado `docs/assets/css/main.css`.
- Después de habilitarlo en una página, valida al menos: navegación por clic sin abandonar la página actual, acceso directo mediante hash, sección activa durante el desplazamiento, estado colapsado en móvil, ausencia del menú en impresión y exclusión de encabezados internos de `TabPanel`.

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

- Define la pestaña inicial con `data-active-tab` en la raíz cuando el valor forme parte del marcado. La prioridad aplicada por la librería es: opción JavaScript `active_tab`, atributo `data-active-tab` y, como respaldo, la primera pestaña válida.
- No agregues `hidden`, roles ARIA, IDs de relación ni estados activos manualmente al marcado inicial. Antes de una inicialización válida, todos los paneles deben permanecer visibles como respaldo progresivo. Al ejecutar `init()`, la librería administra:
  - `is_initialized` en la raíz;
  - `is_active` en la pestaña y el panel seleccionados;
  - `role="tablist"`, `role="tab"` y `role="tabpanel"`;
  - `aria-controls`, `aria-selected` y `aria-labelledby`;
  - IDs internos únicos, `hidden` en paneles inactivos y `type="button"` cuando el botón no lo define.
- Mantén los bloques de código dentro de su panel. Para SCSS y CSS reales, conserva `pre.language-*` con `data-src`; Prism puede cargar esos archivos aunque el panel quede oculto después de inicializar `TabPanel`. El HTML mostrado y el contenido de `Resultado` deben continuar sincronizados.
- Mantén los estilos compartidos de las pestañas en `docs/assets/scss/components/_documentationpage.scss`, dentro de `.documentationpage`. Usa `is_active` para el estado visual y conserva desplazamiento horizontal en `tab_panel_list` para evitar desbordamiento en pantallas estrechas. No agregues estos estilos a un parcial de tema no relacionado.
- Si una página contiene varias raíces, crea una instancia independiente por cada raíz. Los nodos pertenecen a la raíz `data-tab-panel` más cercana; no reutilices botones o paneles entre instancias.
- Si el contenido de una instancia va a retirarse o reemplazarse después de inicializarse, conserva su referencia y llama `destroy()` antes de eliminarlo. Esto cancela los listeners y restaura los atributos administrados por la librería.
- Una estructura inválida deja la instancia con estado `invalid` y mantiene los paneles visibles. Durante la validación, confirma que `get_status()` devuelva `init`, que solo la pestaña inicial tenga `aria-selected="true"`, que los demás paneles tengan `hidden` y que los recursos `data-src` alcancen el estado `loaded`.
- Después de modificar el SCSS del panel, ejecuta `npm exec gulp scss` desde `docs/` y conserva actualizado `docs/assets/css/main.css`. Si la compilación afecta CSS con SVG pendiente de procesar, ejecuta también `npm exec gulp process_svg`. Ejecuta `npm exec gulp lint`; si cambian etiquetas o prosa indexable, regenera además el buscador con `npm exec gulp search_index` y valida con `npm exec gulp jsonlint`.

## Checklist Para Crear Una `pages/` Desde Cero
Antes de construir una página nueva de la documentación, sigue este flujo:

1. Identifica el tipo de página.
2. Confirma la clasificación con el usuario si hay más de una opción posible.
3. Verifica qué archivos deben existir o actualizarse.
4. Revisa si la nueva página necesita recursos de ejemplo y estilos compilados.
5. Comprueba si la navegación, el breadcrumb, el buscador global o el hash routing deben reconocerla.
6. Ajusta los textos en español y valida que el contenido coincida con los recursos reales.
7. Si la página debe mostrar una ruta distinta a la calculada por URL, define `breadcrumb` en su JSON con la estructura simple de items.
8. Si la página o sección debe aparecer en el buscador, crea o actualiza su JSON homónimo en `docs/assets/json/`, registra sus componentes con `id` o `node` estable, y regenera `docs/assets/json/search_index.json` con `npm exec gulp search_index` desde `docs/`.
9. Ejecuta la verificación correspondiente del sitio de documentación.

### Clasificación De Páginas

| Clasificación | Cuándo usarla | Archivos mínimos |
| --- | --- | --- |
| `portada` | Portada general del sitio de documentación. | `docs/index.html`, `docs/assets/js/pages/home.js`, `docs/assets/json/home.json`, componentes de `docs/components/home/` |
| `pagina_referencia` | Página de referencia para un archivo fuente como `base`, `vendor`, `mediaqueries` o `reset`. | `docs/pages/*.html`, `docs/assets/js/pages/*.js`, `docs/assets/json/*.json`, componentes de `docs/components/*/` |
| `nueva_seccion_referencia` | Nueva sección dentro de una página de referencia existente. | `docs/pages/*.html`, `docs/assets/json/*.json`, `docs/components/...`, y estilos o ejemplos asociados si aplica |
| `componente_solo` | Fragmento reutilizable que no necesita una página completa. | `docs/components/...` y, si corresponde, recursos de ejemplo sincronizados |
| `recurso_compartido` | Recurso compartido por varias páginas, como plantillas, encabezados, menús o cargadores. | `docs/components/global/`, `docs/templates/`, `docs/assets/js/core/` o `docs/assets/js/components/` según corresponda |

### Preguntas Que Debo Hacer Antes De Empezar

Si la solicitud no aclara lo suficiente el alcance, pregunta primero. Si existe ambigüedad sobre clasificación, menú, reutilización o recursos, debo preguntar siempre antes de decidir.

1. ¿Qué tipo de página quieres construir: `portada`, `pagina_referencia`, `nueva_seccion_referencia`, `componente_solo` o `recurso_compartido`?
2. ¿La nueva pieza debe vivir en `docs/pages/` o solo en `docs/components/`?
3. ¿Debe tener su propio `docs/assets/js/pages/*.js` y su propio `docs/assets/json/*.json`?
4. ¿Hay que agregar una categoría nueva o reutilizar una existente en `docs/components/global/menu.html`?
5. ¿La pieza necesita ejemplos reales con `docs/assets/scss/...`, `docs/assets/css/...` y HTML de resultado?
6. ¿Debo mantener la estructura visual y de secciones de una página existente o crear una variante nueva?
7. ¿Quieres fijar alguna asunción explícita antes de que implemente la página?

## Guías De Commits Y Pull Requests
- Usa mensajes de commit concisos e imperativos (por ejemplo, `Add grid helpers`, `Fix install path parsing`). Agrupa ediciones relacionadas por commit para mantener el historial legible.
- Las solicitudes de cambio deben describir el cambio, las carpetas afectadas (por ejemplo, `src`, `files/assets/scss/core`), los pasos de verificación manual y cualquier actualización de documentación. Incluye capturas antes/después cuando modifiques la salida visual o páginas de documentación.
