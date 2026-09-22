# Especificación: documentación de `src/sisass_components/_buttons.scss`

## Estado

Implementada.

## Historia de usuario

Como desarrollador que usa SISASS, quiero consultar una documentación completa
de `src/sisass_components/_buttons.scss`, para conocer los mixins disponibles,
sus opciones, estados visuales y marcado requerido sin tener que revisar el
código fuente.

## Objetivo

Crear una página de referencia homogénea con la documentación de
`src/_base.scss` para los tres mixins públicos existentes en
`src/sisass_components/_buttons.scss`:

- `button_simple`
- `button_style_adidas_1`
- `button_bisel`

La documentación debe describir el comportamiento actual de estos mixins sin
modificar su API ni su implementación.

## Decisiones confirmadas

1. La documentación será una nueva `pagina_referencia` independiente.
2. La primera versión documentará los tres mixins existentes en `_buttons.scss`.
3. El menú global tendrá una entrada `_buttons.scss` dentro de una agrupación
   visible para `sisass_components`.
4. La página dividirá los mixins en `Botones básicos` y `Botones estilizados`.
5. Cada mixin tendrá su propio ejemplo y su propio `TabPanel`.
6. Los ejemplos mostrarán los estados relevantes, pero no todas las
   combinaciones posibles de las claves disponibles.
7. Los nombres públicos se mostrarán exactamente como están implementados,
   incluidos los guiones bajos.
8. La documentación reflejará literalmente los valores predeterminados
   actuales.
9. La versión visible de los mixins será `2.x.x`.
10. La documentación explicará el requisito estructural de `.content_link` en
    `button_style_adidas_1` y `button_bisel`.
11. La tarea no añadirá aliases, validaciones ni cambios de comportamiento a
    los mixins.
12. La especificación se mantendrá en `spec/buttons.md` y se registrará en
    `spec/README.md`.

## Alcance

### Incluido

- Crear una página de referencia dedicada a `_buttons.scss`.
- Crear una introducción que describa el propósito del archivo y clasifique sus
  mixins.
- Crear un fragmento documental independiente para cada mixin.
- Documentar todas las claves, tipos, valores predeterminados y efectos
  observables de cada mapa.
- Crear ejemplos visuales sincronizados con SCSS, CSS generado y HTML.
- Integrar la página con el breadcrumb, el menú de la página, la navegación por
  hash, el menú global y el buscador.
- Crear y compilar los estilos necesarios para los ejemplos.
- Validar la página en escritorio y móvil.

### Excluido

- Modificar `src/sisass_components/_buttons.scss`.
- Renombrar mixins, claves o selectores internos.
- Agregar aliases o parámetros nuevos.
- Cambiar valores predeterminados.
- Añadir validaciones Sass a las APIs actuales.
- Incorporar `_buttons.scss` a `src/_sisass.scss`.
- Documentar otros archivos de `src/sisass_components/`.
- Crear una combinación visual para cada valor posible de cada clave.

## Arquitectura de la documentación

La implementación debe crear o actualizar, como mínimo, los siguientes
recursos:

| Archivo o directorio | Responsabilidad |
| --- | --- |
| `docs/pages/buttons.html` | Página de referencia y puntos de inserción de los componentes. |
| `docs/assets/js/pages/buttons.js` | Carga del contenido e inicialización de los comportamientos compartidos. |
| `docs/assets/json/buttons.json` | Breadcrumb y registro ordenado de los componentes de la página. |
| `docs/components/buttons/overview.html` | Descripción de `_buttons.scss` y clasificación de sus mixins. |
| `docs/components/buttons/button_simple.html` | Referencia y ejemplo de `button_simple`. |
| `docs/components/buttons/button_style_adidas_1.html` | Referencia y ejemplo de `button_style_adidas_1`. |
| `docs/components/buttons/button_bisel.html` | Referencia y ejemplo de `button_bisel`. |
| `docs/assets/scss/buttons.scss` | Agregador de los estilos de ejemplo de la página. |
| `docs/assets/scss/buttons/*.scss` | SCSS real utilizado por cada ejemplo. |
| `docs/assets/css/buttons.css` | CSS agregado generado para la página. |
| `docs/assets/css/buttons/*.css` | CSS generado que se muestra en cada ejemplo. |
| `docs/components/global/menu.html` | Acceso global a la página de `_buttons.scss`. |
| `docs/assets/json/components/search_index.json` | Índice regenerado para localizar los mixins. |

No se deben editar manualmente los archivos CSS generados ni el índice del
buscador.

## Estructura de la página

La página debe mantener la estructura visual y funcional de las páginas de
referencia existentes:

1. Contenedor global de documentación y loader.
2. Header compartido.
3. `aside#sidebar_menu` oculto inicialmente.
4. Sección reutilizada `src`.
5. Fragmento introductorio de `_buttons.scss`.
6. Encabezado `Botones básicos` y sección `button_simple`.
7. Encabezado `Botones estilizados` y secciones
   `button_style_adidas_1` y `button_bisel`.

Los encabezados de categoría deben tener identificadores estables y
`data-page-menu-item`. Los anchors públicos de los mixins serán:

- `button_simple`
- `button_style_adidas_1`
- `button_bisel`

## Breadcrumb

El JSON de la página debe declarar manualmente la ruta de origen:

```text
src / sisass_components / _buttons.scss
```

El último elemento representa el archivo actual. Los elementos anteriores
pueden enlazar a las referencias existentes cuando haya un destino válido.

## Menú global

El menú debe incorporar una agrupación visible llamada `sisass_components`
dentro de la navegación de `src`. Esta agrupación debe contener un enlace a
`../pages/buttons.html` con el texto `_buttons.scss` y un identificador que
permita marcarlo como elemento activo desde `data-link`.

## Contrato de los fragmentos documentales

Cada mixin debe usar un `article` con identificador y clase estables. Su
contenido debe respetar este orden:

1. `group_title` con nombre del mixin y archivo `_buttons.scss`.
2. `Tipo: Mixin`.
3. `Versión: 2.x.x`.
4. Uno o dos párrafos cortos de descripción.
5. Título `Interface` y firma basada en mapa con claves y defaults explícitos.
6. Subtítulo `Sintaxis map`.
7. Tabla de parámetros con `Clave`, `Tipo`, `Default` y `Descripción`.
8. Título `Ejemplo`.
9. `TabPanel` con las pestañas `Resultado`, `SCSS`, `CSS generado` y `HTML`,
   en ese orden y con `Resultado` como pestaña inicial.

Los identificadores técnicos y fragmentos de código deben permanecer en
inglés. La prosa, etiquetas y descripciones deben escribirse en español.

## Mixin `button_simple`

### Propósito

Documentar un botón básico configurable mediante un mapa. La descripción debe
explicar los estados normal, `:hover` y `.active`, así como la transición entre
ellos.

### Interface documentada

```scss
@mixin button_simple($attr: (
    bg: #FFF,
    bg_hover: #000,
    color: #000,
    color_hover: #FFF,
    size: 18,
    font: "sans-serif",
    weight: normal,
    align: center,
    uppercase: uppercase,
    width: 65px,
    height: 45px,
    border_color: #000,
    border_color_hover: #000,
    border_size: 1px,
    border_style: solid,
    time: 500ms
));
```

### Claves

| Clave | Tipo | Default | Comportamiento documentado |
| --- | --- | --- | --- |
| `bg` | Color | `#FFF` | Define el fondo del estado normal. |
| `bg_hover` | Color | `#000` | Define el fondo de `:hover` y `.active`. |
| `color` | Color | `#000` | Define el color del texto en el estado normal. |
| `color_hover` | Color | `#FFF` | Define el color del texto en `:hover` y `.active`. |
| `size` | Number | `18` | Define el tamaño de fuente normalizado por SISASS. |
| `font` | String | `"sans-serif"` | Define la familia tipográfica. |
| `weight` | String \| Number | `normal` | Define el peso tipográfico. |
| `align` | String | `center` | Define la alineación del texto. |
| `uppercase` | String | `uppercase` | Define la transformación del texto. |
| `width` | Medida | `65px` | Define el ancho del botón. |
| `height` | Medida | `45px` | Define el alto del botón. |
| `border_color` | Color | `#000` | Define el color del borde normal. |
| `border_color_hover` | Color | `#000` | Define el color del borde de `:hover` y `.active`. |
| `border_size` | Medida | `1px` | Define el grosor del borde. |
| `border_style` | String | `solid` | Define el estilo del borde. |
| `time` | Tiempo | `500ms` | Define la duración de la transición. |

### Ejemplo requerido

El resultado debe mostrar al menos un botón interactivo y una variante con la
clase `.active`. El ejemplo debe permitir comprobar los estilos normal, hover y
activo sin JavaScript específico.

## Mixin `button_style_adidas_1`

### Propósito

Documentar un botón estilizado con doble contorno, desplazamiento visual en
hover, soporte de estado disabled e iconos de flecha opcionales.

La documentación debe indicar que el elemento al que se aplica el mixin debe
contener un descendiente `.content_link`, ya que el contenido, los colores, el
borde y los iconos se aplican a ese nodo interno.

### Interface documentada

```scss
@mixin button_style_adidas_1($attr: (
    width: 280px,
    ratio: 5.16,
    bg: #000,
    bg_hover: #000,
    bg_disabled: lighten(#000, 80%),
    color: #FFF,
    color_hover: #FFF,
    color_disabled: lighten(#000, 40%),
    font: "sans-serif",
    size: 18,
    weight: bold,
    transform: uppercase,
    align: center,
    time: 200ms,
    border_color: #000,
    border_color_hover: #000,
    border_color_disabled: lighten(#000, 80%),
    border_size: 1px,
    border_style: solid,
    icon_right: false,
    icon_left: false
));
```

### Claves

| Clave | Tipo | Default | Comportamiento documentado |
| --- | --- | --- | --- |
| `width` | Medida | `280px` | Define el ancho del botón y de `.content_link`. |
| `ratio` | Number | `5.16` | Define la relación de aspecto exterior e interior. |
| `bg` | Color | `#000` | Define el fondo normal de `.content_link`. |
| `bg_hover` | Color | `#000` | Define el fondo de `.content_link` durante hover. |
| `bg_disabled` | Color | `lighten(#000, 80%)` | Define el fondo del estado disabled. |
| `color` | Color | `#FFF` | Define el color del contenido normal. |
| `color_hover` | Color | `#FFF` | Define el color del contenido durante hover. |
| `color_disabled` | Color | `lighten(#000, 40%)` | Define el color del contenido disabled. |
| `font` | String | `"sans-serif"` | Define la familia tipográfica. |
| `size` | Number | `18` | Define el tamaño de fuente normalizado por SISASS. |
| `weight` | String \| Number | `bold` | Define el peso tipográfico. |
| `transform` | String | `uppercase` | Define la transformación del texto. |
| `align` | String | `center` | Define la alineación del texto. |
| `time` | Tiempo | `200ms` | Define la duración de las transiciones. |
| `border_color` | Color | `#000` | Define el color del borde normal. |
| `border_color_hover` | Color | `#000` | Define el color del borde durante hover. |
| `border_color_disabled` | Color | `lighten(#000, 80%)` | Define el color del borde disabled. |
| `border_size` | Medida | `1px` | Define el grosor del borde. |
| `border_style` | String | `solid` | Define el estilo del borde. |
| `icon_right` | Boolean | `false` | Añade una flecha derecha mediante `::after`. |
| `icon_left` | Boolean | `false` | Añade una flecha izquierda mediante `::before`. |

### Ejemplo requerido

El resultado debe incluir:

- Una variante con `icon_right: true`.
- Una variante con `icon_left: true`.
- Una variante disabled que permita comprobar sus colores, borde y cursor.
- El nodo `.content_link` en cada botón.

El ejemplo puede usar `disabled` o `.disabled` de acuerdo con el elemento HTML
elegido, pero debe reflejar el comportamiento real del mixin.

## Mixin `button_bisel`

### Propósito

Documentar un botón con apariencia biselada construida mediante gradientes, un
pseudoelemento interior y un nodo `.content_link` superpuesto.

La documentación debe explicar que `.content_link` es obligatorio para mostrar
y posicionar correctamente el contenido del botón.

### Interface documentada

```scss
@mixin button_bisel($attr: (
    width: 140px,
    height: 55px,
    diff: 10px,
    bg1: #FFF,
    bg2: #000,
    bg_opacity: 0.4,
    border_contain: false,
    border: 2px solid #000,
    aspect_inside: 2.8,
    font: "sans-serif",
    size: 18,
    weight: bold,
    opacity_before: 1,
    color: #FFF,
    color_hover: #FFF
));
```

### Claves

| Clave | Tipo | Default | Comportamiento documentado |
| --- | --- | --- | --- |
| `width` | Medida | `140px` | Define el ancho exterior del botón. |
| `height` | Medida | `55px` | Define el alto exterior del botón. |
| `diff` | Medida | `10px` | Reduce el ancho del pseudoelemento interior respecto al ancho exterior. |
| `bg1` | Color | `#FFF` | Define el primer color de los gradientes. |
| `bg2` | Color | `#000` | Define el segundo color de los gradientes. |
| `bg_opacity` | Number | `0.4` | Define la opacidad aplicada a los colores de los gradientes. |
| `border_contain` | Boolean | `false` | Activa el borde del contenedor exterior. |
| `border` | Border | `2px solid #000` | Define el borde exterior cuando está habilitado. |
| `aspect_inside` | Number | `2.8` | Define la relación de aspecto del pseudoelemento interior. |
| `font` | String | `"sans-serif"` | Define la familia tipográfica. |
| `size` | Number | `18` | Define el tamaño de fuente normalizado por SISASS. |
| `weight` | String \| Number | `bold` | Define el peso tipográfico. |
| `opacity_before` | Number | `1` | Define la opacidad del pseudoelemento interior. |
| `color` | Color | `#FFF` | Define el color normal de `.content_link`. |
| `color_hover` | Color | `#FFF` | Define el color de `.content_link` durante hover. |

### Ejemplo requerido

El resultado debe mostrar una variante básica y otra con
`border_contain: true`. Ambas deben contener `.content_link` y permitir observar
el cambio del gradiente y del color durante hover.

## Assets de ejemplo

Cada archivo SCSS de ejemplo debe consumir el mixin real con:

```scss
@use "sisass_components/buttons" as *;
```

Los selectores de ejemplo deben quedar limitados al contexto de la página de
documentación cuando sea necesario para evitar efectos sobre otras páginas.

El HTML visible en cada pestaña debe coincidir con el HTML utilizado en
`Resultado`. El CSS mostrado debe ser el resultado compilado del SCSS mostrado.

## Comportamiento JavaScript

`docs/assets/js/pages/buttons.js` debe seguir el flujo de las páginas de
referencia existentes:

1. Registrar los estados requeridos por el loader.
2. Cargar `json/buttons.json` mediante `contentLoad`.
3. Inicializar cada raíz `[data-tab-panel]` con una instancia independiente de
   `TabPanel`.
4. Inicializar el menú de la página.
5. Inicializar el breadcrumb con el JSON de la página.
6. Inicializar la navegación por hash.
7. Inicializar el buscador global.
8. Completar los estados del loader.

No se requiere JavaScript específico para los ejemplos de botones.

## Buscador

El JSON debe registrar cada fragmento con un `id` y `node` estable que coincida
con su sección renderizada. Después de crear la página y sus componentes se
debe regenerar `docs/assets/json/components/search_index.json`.

Como mínimo deben validarse las búsquedas `button_simple`,
`button_style_adidas_1` y `button_bisel`. Cada resultado debe abrir
`pages/buttons.html` con el anchor correspondiente.

## Criterios de aceptación

1. Existe una página funcional `docs/pages/buttons.html` accesible desde el
   menú global.
2. El breadcrumb muestra `src / sisass_components / _buttons.scss`.
3. La introducción describe el archivo y clasifica sus tres mixins.
4. `button_simple`, `button_style_adidas_1` y `button_bisel` tienen fragmentos
   independientes y anchors estables.
5. Cada fragmento contiene descripción, interface, tabla completa y ejemplo.
6. Las tablas coinciden con las claves y defaults implementados en el archivo
   fuente.
7. Los ejemplos se compilan consumiendo el mixin real y no una copia de su
   implementación.
8. Cada ejemplo presenta `Resultado`, `SCSS`, `CSS generado` y `HTML` en un
   `TabPanel` válido.
9. Los ejemplos de `button_style_adidas_1` y `button_bisel` usan
   `.content_link` correctamente.
10. Los estados normal, hover, active o disabled requeridos para cada mixin son
    verificables en el resultado visual.
11. El menú de la página permite navegar a sus categorías sin abandonar la
    ruta actual.
12. Los accesos directos mediante hash abren la sección correspondiente.
13. La página mantiene una presentación utilizable en escritorio y móvil.
14. El buscador encuentra los tres mixins y dirige al anchor correcto.
15. `src/sisass_components/_buttons.scss` no recibe cambios funcionales.

## Verificación

Desde `docs/` se deben ejecutar:

```bash
npm exec gulp scss
npm exec gulp lint
npm exec gulp search_index
npm exec gulp jsonlint
```

También se debe validar en el navegador:

- Carga completa de la página sin errores de consola.
- Estado `init` de cada `TabPanel`.
- Una sola pestaña seleccionada y paneles inactivos ocultos después de la
  inicialización.
- Carga de los recursos SCSS y CSS mostrados por Prism.
- Navegación por clic y acceso directo mediante hash.
- Estado activo del menú durante el desplazamiento.
- Comportamiento colapsado del menú en pantallas estrechas.
- Ausencia del menú de página durante impresión.
- Estados visuales de los tres ejemplos.
- Resultados correctos para las tres búsquedas representativas.
