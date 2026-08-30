# Especificación: modernización de media queries

## Estado

Definida para implementación.

## Historia de usuario

Como desarrollador que usa SISASS, quiero disponer de mixins de media queries
actuales, consistentes y fáciles de combinar, para adaptar una interfaz por
tamaño, orientación, interacción, capacidades de pantalla y preferencias del
usuario sin escribir manualmente cada regla `@media`.

## Objetivo

Modernizar `src/_mediaqueries.scss` para:

- Conservar las llamadas existentes.
- Incorporar sintaxis alternativa mediante mapas.
- Corregir la construcción de medidas y evitar unidades inválidas.
- Añadir rangos del mismo eje.
- Cubrir media features actuales de uso general.
- Permitir combinar condiciones mediante una única API basada en mapas.
- Producir errores descriptivos cuando una configuración sea inválida.
- Mantener sincronizada la documentación de `_mediaqueries.scss`.

## Decisiones confirmadas

1. La documentación y esta especificación se redactan en español.
2. Se conservan los nombres `brp`, `brph`, `brpp`, `brpl`, `brpwh` y `mbr`.
3. SISASS conserva su enfoque desktop-first y `max` continúa siendo el valor
   predeterminado.
4. Los mixins existentes mantienen sus parámetros secuenciales y reciben una
   sintaxis map alternativa.
5. Se incorpora un mixin genérico map-only llamado `media`.
6. Se incorpora un mixin llamado `media-range` para rangos entre dos medidas.
7. Las preferencias de accesibilidad forman parte de la primera versión.
8. Las media features especializadas no reciben un mixin individual.
9. Los números sin unidad usados como dimensiones se interpretan como píxeles.
10. Una configuración inválida produce `@error`.
11. `mbr` admite mapas por breakpoint y conserva el índice enviado a `@content`.
12. Las condiciones se combinan mediante `and` por defecto; `or` y `not` deben
    solicitarse explícitamente.
13. Los alias cortos se limitan a las opciones frecuentes.
14. El alcance incluye documentación, ejemplos y CSS generado.
15. Las container queries quedan fuera de esta especificación.

## Alcance

### Incluido

- Modernización de `src/_mediaqueries.scss`.
- Compatibilidad con llamadas secuenciales existentes.
- Sintaxis map en los mixins existentes, excepto `mbr`, cuya entrada continúa
  siendo variádica y cuyos elementos pueden ser números o mapas.
- Nuevos mixins `media-range` y `media`.
- Validación de tipos, unidades, claves y valores discretos.
- Actualización de la página existente de media queries.
- Ejemplos SCSS, CSS generado, HTML y resultado.
- Actualización del buscador global de la documentación.

### Excluido

- Container queries mediante `@container`.
- Custom media queries mediante `@custom-media`.
- Cambios al enfoque desktop-first de SISASS.
- Eliminación o renombrado de mixins existentes.
- Detección de navegadores o dispositivos mediante user agent.
- Mixins individuales para cada media feature especializada.
- Polyfills para navegadores que no soporten una media feature.

## Compatibilidad retroactiva

Las siguientes firmas secuenciales deben continuar disponibles sin cambiar el
orden ni el nombre de sus parámetros actuales:

```scss
@mixin brp($punto, $type: max, $units: px, $means: screen);
@mixin brpp($punto, $type: max, $units: px, $means: screen);
@mixin brpl($punto, $type: max, $units: px, $means: screen);
@mixin brph($punto, $type: max, $units: px, $means: screen);
@mixin brpwh($puntow, $puntoh, $type: max, $units: px, $means: screen);
@mixin mbr($points...);
```

Esta conservación incluye llamadas realizadas mediante argumentos nombrados de
Sass. Los nombres históricos de parámetros no se traducen ni se reemplazan en
las firmas existentes.

El CSS generado por una llamada válida existente debe conservar el mismo
comportamiento. Solo puede cambiar cuando la salida anterior fuera inválida,
como `48rempx`, o cuando el nuevo manejo de unidades sea necesario para producir
CSS válido.

## Normalización de valores

### Dimensiones

Los valores de ancho y alto siguen estas reglas:

| Entrada | Resultado |
| --- | --- |
| `768` | `768px` |
| `768px` | `768px` |
| `48rem` | `48rem` |
| `60em` | `60em` |
| `100dvh` | `100dvh` |

El parámetro `units` o la clave `unit` solo se aplica cuando la medida recibida
no tiene unidad. Si la medida ya incluye una unidad válida, debe conservarse y
no debe concatenarse una segunda unidad.

```scss
@include brp(48rem);
```

Debe producir una condición equivalente a:

```css
@media only screen and (max-width: 48rem) {}
```

### Resolución

Los números sin unidad usados en `resolution`, `min_resolution` o
`max_resolution` se interpretan como `dppx`.

| Entrada | Resultado |
| --- | --- |
| `2` | `2dppx` |
| `192dpi` | `192dpi` |
| `75dpcm` | `75dpcm` |

### Valores discretos

Las media features discretas no reciben unidades. Sus valores deben conservarse
como keywords y validarse contra los valores admitidos por cada característica.

### Valores no válidos

Una dimensión debe ser un número Sass, con o sin unidad. Keywords como `auto`,
`inherit`, `initial` o `none` no son breakpoints válidos y deben producir
`@error` cuando se utilicen como ancho, alto, rango o resolución.

## Mixins existentes

### `brp`

Genera una condición por ancho. Mantiene la sintaxis secuencial y añade esta
sintaxis alternativa:

```scss
@include brp((
    point: 768,
    type: max,
    unit: px,
    media: screen
)) {
    // Styles
}
```

Claves admitidas:

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `point | p` | Number | Requerido | Define el límite de ancho. |
| `type | t` | Keyword | `max` | Selecciona `min-width` o `max-width`. |
| `unit | units | u` | String | `px` | Unidad para un número unitless. |
| `media | means | m` | Keyword | `screen` | Define el media type. |

### `brph`

Usa la misma API de `brp`, pero genera `min-height` o `max-height`.

### `brpp`

Usa la misma API de `brph` y añade siempre `(orientation: portrait)`. La
orientación no es configurable desde este mixin porque forma parte de su
contrato público.

### `brpl`

Usa la misma API de `brp` y añade siempre `(orientation: landscape)`. La
orientación no es configurable desde este mixin.

### `brpwh`

Mantiene su firma secuencial y añade esta sintaxis alternativa:

```scss
@include brpwh((
    width: 1200,
    height: 800,
    type: maxmin,
    unit: px,
    media: screen
)) {
    // Styles
}
```

Claves admitidas:

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `width | w` | Number | Requerido | Define el límite de ancho. |
| `height | h` | Number | Requerido | Define el límite de alto. |
| `type | t` | Keyword | `max` | Admite `max`, `min`, `maxmin` o `minmax`. |
| `unit | units | u` | String | `px` | Unidad para dimensiones unitless. |
| `media | means | m` | Keyword | `screen` | Define el media type. |

Los tipos conservan este significado:

| Tipo | Ancho | Alto |
| --- | --- | --- |
| `max` | `max-width` | `max-height` |
| `min` | `min-width` | `min-height` |
| `maxmin` | `max-width` | `min-height` |
| `minmax` | `min-width` | `max-height` |

El mismo valor de `unit` se usa únicamente como fallback para dimensiones sin
unidad. Una dimensión con unidad propia debe conservarla, aunque la otra
dimensión use el fallback.

## Nuevo mixin `media-range`

### Propósito

Generar un rango inclusivo del mismo eje sin escribir dos condiciones
manualmente.

### Interface secuencial

```scss
@mixin media-range(
    $min,
    $max,
    $axis: width,
    $units: px,
    $means: screen
);
```

Ejemplo:

```scss
@include media-range(768, 1200) {
    // Styles
}
```

Debe generar condiciones equivalentes a:

```css
@media only screen and (min-width: 768px) and (max-width: 1200px) {}
```

### Sintaxis alternativa map

```scss
@include media-range((
    min: 48rem,
    max: 75rem,
    axis: width,
    unit: px,
    media: screen
)) {
    // Styles
}
```

Claves admitidas:

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `min` | Number | Requerido | Límite inferior inclusivo. |
| `max` | Number | Requerido | Límite superior inclusivo. |
| `axis` | Keyword | `width` | Admite `width` o `height`. |
| `unit | units | u` | String | `px` | Unidad para límites unitless. |
| `media | means | m` | Keyword | `screen` | Define el media type. |

El límite `min` debe ser menor o igual que `max` cuando Sass pueda comparar
ambas medidas. Si las unidades no son comparables durante la compilación, el
mixin debe conservarlas y generar la consulta sin intentar convertirlas.

## Nuevo mixin `media`

### Propósito

Combinar media features actuales mediante un único mapa. Este mixin no admite
una firma posicional alternativa.

```scss
@mixin media($attr: ());
```

Ejemplo:

```scss
@include media((
    min_width: 768,
    max_width: 1200,
    orientation: landscape,
    hover: hover,
    pointer: fine
)) {
    // Styles
}
```

### Claves de control

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `media` | Keyword | `screen` | Media type de la consulta. |
| `operator` | Keyword | `and` | Combina las condiciones con `and` u `or`. |
| `not` | Bool | `false` | Niega el grupo completo de condiciones. |

Todas las condiciones de un mismo mapa usan el operador seleccionado. La
primera versión no necesita representar grupos anidados que mezclen `and` y
`or` en distintos niveles.

### Dimensiones y pantalla

| Clave | Valores admitidos |
| --- | --- |
| `width` | Medida exacta |
| `min_width` | Medida mínima inclusiva |
| `max_width` | Medida máxima inclusiva |
| `height` | Medida exacta |
| `min_height` | Medida mínima inclusiva |
| `max_height` | Medida máxima inclusiva |
| `orientation` | `portrait`, `landscape` |
| `aspect_ratio` | Ratio exacto, por ejemplo `16 / 9` |
| `min_aspect_ratio` | Ratio mínimo |
| `max_aspect_ratio` | Ratio máximo |
| `resolution` | Resolución exacta |
| `min_resolution` | Resolución mínima |
| `max_resolution` | Resolución máxima |
| `color_gamut` | `srgb`, `p3`, `rec2020` |
| `dynamic_range` | `standard`, `high` |
| `display_mode` | `browser`, `fullscreen`, `standalone`, `minimal-ui`, `window-controls-overlay`, `picture-in-picture` |

### Interacción

| Clave | Valores admitidos |
| --- | --- |
| `hover` | `none`, `hover` |
| `any_hover` | `none`, `hover` |
| `pointer` | `none`, `coarse`, `fine` |
| `any_pointer` | `none`, `coarse`, `fine` |

`pointer` y `hover` describen el mecanismo principal. `any_pointer` y
`any_hover` describen las capacidades disponibles entre todos los mecanismos
de interacción detectados.

### Preferencias y accesibilidad

| Clave | Media feature generada | Valores admitidos |
| --- | --- | --- |
| `reduced_motion` | `prefers-reduced-motion` | `no-preference`, `reduce` |
| `color_scheme` | `prefers-color-scheme` | `light`, `dark` |
| `contrast` | `prefers-contrast` | `no-preference`, `less`, `more`, `custom` |
| `forced_colors` | `forced-colors` | `none`, `active` |
| `reduced_transparency` | `prefers-reduced-transparency` | `no-preference`, `reduce` |
| `reduced_data` | `prefers-reduced-data` | `no-preference`, `reduce` |

Las claves Sass usan `snake_case`; al generar CSS deben convertirse a los
nombres estándar con guiones.

### Media features especializadas

La primera versión no debe ofrecer claves dedicadas para:

- `color`
- `color-index`
- `monochrome`
- `overflow-block`
- `overflow-inline`
- `update`
- `scan`
- `grid`
- `scripting`
- `inverted-colors`
- `environment-blending`
- `nav-controls`
- `video-color-gamut`
- `video-dynamic-range`
- `horizontal-viewport-segments`
- `vertical-viewport-segments`

Estas características podrán incorporarse posteriormente como claves del
mixin `media` sin crear mixins públicos individuales.

## Modernización de `mbr`

`mbr` debe continuar aceptando números como entrada legacy:

```scss
@include mbr(1200, 992, 768) using ($index) {
    // Styles
}
```

Cada número genera un `brp` con los defaults `max`, `px` y `screen`.

También debe aceptar mapas con la misma API de `brp`:

```scss
@include mbr(
    (point: 1200, type: max),
    (point: 768, type: max),
    (point: 48, type: max, unit: rem)
) using ($index) {
    // Styles
}
```

Se permite mezclar números y mapas en una misma llamada. En cada iteración:

1. Se valida el punto actual.
2. Se genera la media query correspondiente.
3. Se ejecuta `@content($index)`.
4. El índice comienza en `1` y conserva el orden recibido.

Una lista vacía debe producir `@error`.

## Operadores y media types

### Operadores

- Los mixins legacy conservan sus condiciones con `and`.
- `media-range` combina sus dos límites con `and`.
- `media` usa `and` por defecto.
- `operator: or` combina todas las condiciones del mapa con `or`.
- `not: true` niega el resultado del grupo completo.
- `operator` solo admite `and` u `or`.
- `not` solo admite valores booleanos.

### Media types

El valor predeterminado es `screen`. Se admiten como mínimo `all`, `print`,
`screen` y `speech`. Un media type no reconocido debe producir `@error` para
evitar consultas silenciosamente inactivas.

## Validaciones y errores

La API debe producir `@error` con el nombre del mixin y una explicación breve
en los siguientes casos:

1. Falta una medida requerida.
2. Una medida no es un número Sass.
3. `type` no pertenece al conjunto admitido por el mixin.
4. `axis` no es `width` o `height`.
5. `min` es mayor que `max` y las unidades son comparables.
6. Una resolución no es numérica o usa una unidad incompatible.
7. Un ratio no es válido o es menor o igual que cero.
8. Una media feature discreta recibe un keyword no soportado.
9. `media` recibe un valor no soportado.
10. `operator` no es `and` u `or`.
11. `not` no es booleano.
12. El mapa está vacío.
13. El mapa contiene una clave desconocida.
14. `mbr` no recibe breakpoints.

No se debe omitir silenciosamente una media query inválida ni generar una regla
vacía como mecanismo de recuperación.

## Documentación

La implementación debe actualizar la página existente
`docs/pages/mediaqueries.html` y su configuración asociada.

### Componentes existentes

Se deben actualizar:

- `docs/components/mediaqueries/brp.html`
- `docs/components/mediaqueries/brph.html`
- `docs/components/mediaqueries/brpp.html`
- `docs/components/mediaqueries/brpl.html`
- `docs/components/mediaqueries/brpwh.html`
- `docs/components/mediaqueries/mbr.html`

Cada componente debe documentar por separado los parámetros secuenciales y la
sintaxis map cuando ambas formas estén disponibles.

### Componentes nuevos

Se deben crear:

- `docs/components/mediaqueries/media_range.html`
- `docs/components/mediaqueries/media.html`

También se deben crear sus ejemplos sincronizados en:

- `docs/assets/scss/mediaqueries/`
- `docs/assets/css/mediaqueries/`

### Estructura y navegación

- `docs/pages/mediaqueries.html` debe incluir secciones estables para
  `media_range` y `media`.
- `docs/assets/json/mediaqueries.json` debe registrar los nuevos componentes.
- La clasificación inicial de la página debe explicar las categorías de
  dimensiones, orientación, interacción, pantalla y preferencias.
- No se agrega una categoría nueva al menú global porque los recursos continúan
  perteneciendo a `_mediaqueries.scss`.
- Los nuevos ejemplos completos deben presentarse con `TabPanel` en el orden
  `Resultado`, `SCSS`, `CSS generado` y `HTML`.
- El script de la página debe inicializar los paneles después de completar
  `contentLoad`.

### Contenido mínimo de ejemplos

La documentación debe incluir, como mínimo:

1. Un número unitless convertido a `px`.
2. Una medida `rem` conservada sin concatenar `px`.
3. Una llamada secuencial y su equivalente map.
4. Un rango entre dos anchos.
5. Una combinación de orientación, hover y pointer.
6. Un ejemplo con `prefers-reduced-motion`.
7. Un ejemplo con `prefers-color-scheme`.
8. Un `mbr` con breakpoints configurados mediante mapas.

La prosa y los ejemplos indexables deben incorporarse al buscador global
mediante la tarea `search_index`; el JSON generado no se edita manualmente.

## Verificación

### Compilación Sass

Se debe comprobar como mínimo esta matriz:

| Caso | Resultado esperado |
| --- | --- |
| `brp(768)` | `max-width: 768px` |
| `brp(48rem)` | `max-width: 48rem` |
| `brp(48, max, rem)` | `max-width: 48rem` |
| `brp((point: 768, type: min))` | `min-width: 768px` |
| `brph(700)` | `max-height: 700px` |
| `brpp(700)` | Altura máxima y orientación portrait |
| `brpl(1024)` | Ancho máximo y orientación landscape |
| `brpwh(1200, 800, maxmin)` | Ancho máximo y alto mínimo |
| `media-range(768, 1200)` | Rango inclusivo de ancho |
| `resolution: 2` | `resolution: 2dppx` |
| `reduced_motion: reduce` | `prefers-reduced-motion: reduce` |
| `color_scheme: dark` | `prefers-color-scheme: dark` |
| `pointer: coarse` | `pointer: coarse` |
| `not: true` | Negación del grupo completo |
| `operator: or` | Condiciones combinadas con `or` |

También se deben probar los errores definidos en esta especificación y confirmar
que cada uno detenga la compilación con un mensaje identificable.

### Documentación

Desde `docs/` se deben ejecutar las tareas aplicables:

```bash
npm exec gulp scss
npm exec gulp search_index
npm exec gulp jsonlint
npm exec gulp lint
```

Si `package.json` incorpora un script `test`, también se debe ejecutar:

```bash
npm run test
```

Se debe inspeccionar al menos una consulta representativa del buscador y
confirmar que abre `pages/mediaqueries.html` con el hash correcto.

## Criterios de aceptación

1. Todas las llamadas secuenciales válidas existentes siguen compilando.
2. `brp`, `brph`, `brpp`, `brpl` y `brpwh` admiten mapas documentados.
3. Una medida con unidad no recibe una segunda unidad.
4. Un número unitless usado como dimensión se convierte en píxeles.
5. `media-range` genera límites inclusivos del mismo eje.
6. `media` combina dimensiones, pantalla, interacción y preferencias.
7. `and` es el operador predeterminado y `or` puede solicitarse explícitamente.
8. `not` niega el grupo completo cuando se configura como `true`.
9. `mbr` admite números, mapas y combinaciones de ambos.
10. `mbr` conserva el índice de iteración desde `1`.
11. Las configuraciones inválidas producen `@error` descriptivos.
12. No se generan valores como `48rempx`.
13. Las preferencias de accesibilidad definidas tienen ejemplos funcionales.
14. La documentación muestra interfaces, parámetros, ejemplos y resultados
    sincronizados.
15. Los nuevos recursos aparecen en la página y en el buscador global.
16. Los assets SCSS y CSS de la documentación quedan sincronizados.
17. La compilación y las tareas de validación terminan correctamente.

## Referencias normativas

- [Media Queries Level 4](https://www.w3.org/TR/mediaqueries-4/)
- [Media Queries Level 5](https://www.w3.org/TR/mediaqueries-5/)
- [CSS Containment Level 3](https://www.w3.org/TR/css-contain-3/)

