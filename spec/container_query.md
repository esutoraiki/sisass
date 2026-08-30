# Especificación: mixin `container-query`

## Estado

Definida para implementación.

## Historia de usuario

Como desarrollador que usa SISASS, quiero construir consultas de contenedor con
una API consistente con los mixins responsive del framework, para adaptar un
componente al espacio que le proporciona su contenedor sin escribir manualmente
cada regla `@container`.

## Objetivo

Incorporar en `src/_mediaqueries.scss` un mixin llamado `container-query` que:

- Ofrezca una interfaz posicional sencilla para el caso frecuente de consultar
  el ancho con un enfoque desktop-first.
- Ofrezca una sintaxis alternativa mediante mapa para consultas combinadas.
- Permita consultar contenedores nombrados y anónimos.
- Valide dimensiones, proporciones, orientación, operadores y nombres.
- Produzca errores descriptivos cuando una configuración sea inválida.
- Mantenga sincronizada la documentación de `_mediaqueries.scss`.

## Decisiones confirmadas

1. La documentación y esta especificación se redactan en español.
2. El nombre público del mixin es `container-query`.
3. La interfaz posicional genera una consulta por ancho con enfoque
   desktop-first.
4. El ancho predeterminado de la interfaz posicional es `1920px`.
5. El mixin también admite una sintaxis alternativa mediante mapa para las
   consultas avanzadas.
6. El nombre del contenedor es opcional.
7. Un mapa que solo proporciona `name` genera una consulta desktop-first con
   `max-width: 1920px`, el mismo default de la interfaz posicional.
8. La primera versión cubre consultas de tamaño, proporción y orientación.
9. Las condiciones se combinan mediante `and` por defecto y pueden combinarse
   mediante `or` de forma explícita.
10. Las condiciones se generan con la sintaxis clásica, como
    `min-width: 480px`, y no con la sintaxis de rangos.
11. El mixin no declara automáticamente `container-name` ni `container-type`.
12. No se generan fallbacks para navegadores sin soporte de container queries.
13. El mixin complementa a `media`, `media-range` y `brp`; no reemplaza ni
    modifica sus contratos.
14. La funcionalidad incluye documentación, ejemplos reales, CSS generado e
    incorporación al buscador global.

## Alcance

### Incluido

- Incorporar `container-query` en `src/_mediaqueries.scss`.
- Generar consultas de contenedor anónimas y nombradas.
- Proporcionar una interfaz posicional para consultas desktop-first por ancho.
- Proporcionar una sintaxis map para condiciones simples o combinadas.
- Admitir dimensiones con o sin unidad.
- Admitir proporciones y orientación.
- Combinar todas las condiciones mediante un operador común.
- Validar claves, tipos, unidades, nombres y valores discretos.
- Crear una sección en la página de referencia de media queries.
- Crear un ejemplo sincronizado con vistas de resultado, SCSS, CSS generado y
  HTML.
- Incorporar la nueva sección al buscador global de la documentación.

### Excluido

- Consultas de estilo mediante `style()`.
- Consultas de estado de desplazamiento mediante `scroll-state()`.
- Sintaxis de rangos como `width >= 480px`.
- Declaración automática de `container-name` o `container-type`.
- Polyfills o fallbacks para navegadores sin soporte de `@container`.
- Modificación de los mixins responsive existentes.
- Creación de una categoría nueva en el menú global de la documentación.

## Contrato funcional

### Interface posicional

```scss
@mixin container-query(
    $point: 1920,
    $name: null,
    $units: px
);
```

| Parámetro | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `point` | Number | `1920` | Define el ancho máximo de la consulta desktop-first. |
| `name` | String \| Keyword | `null` | Identifica el contenedor consultado; `null` usa el contenedor elegible más cercano. |
| `units` | String | `px` | Define la unidad aplicada cuando `point` no tiene unidad. |

La interfaz posicional siempre debe generar una condición `max-width`. Un valor
unitless debe recibir la unidad indicada en `units`; un valor que ya incluya una
unidad válida debe conservarla.

```scss
.product_card {
    @include container-query(1200) {
        grid-template-columns: 8rem 1fr;
    }
}
```

Debe producir una consulta equivalente a:

```css
@container (max-width: 1200px) {
    .product_card {
        grid-template-columns: 8rem 1fr;
    }
}
```

El nombre puede proporcionarse sin cambiar el comportamiento desktop-first:

```scss
.product_card {
    @include container-query(64rem, product_list) {
        grid-template-columns: 1fr;
    }
}
```

Debe producir una consulta equivalente a:

```css
@container product_list (max-width: 64rem) {
    .product_card {
        grid-template-columns: 1fr;
    }
}
```

Una llamada sin argumentos usa el ancho predeterminado:

```scss
@include container-query() {
    // Styles
}
```

Debe generar una condición equivalente a:

```css
@container (max-width: 1920px) {}
```

### Sintaxis alternativa mediante mapa

Cuando el primer argumento es un mapa, el mixin utiliza la interfaz avanzada:

```scss
@include container-query((
    name: product_list,
    min_width: 480px,
    orientation: landscape,
    operator: and
)) {
    // Styles
}
```

#### Claves de control

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `name` | String \| Keyword | `null` | Identifica el contenedor consultado. |
| `operator` | Keyword | `and` | Combina las condiciones mediante `and` u `or`. |
| `unit \| units \| u` | String | `px` | Define la unidad para dimensiones unitless. |

#### Condiciones

| Clave | Tipo | Default | Comportamiento |
| --- | --- | --- | --- |
| `width` | Number | `null` | Consulta el ancho exacto del contenedor. |
| `min_width` | Number | `null` | Consulta un ancho mínimo inclusivo. |
| `max_width` | Number | `null` | Consulta un ancho máximo inclusivo. |
| `height` | Number | `null` | Consulta el alto exacto del contenedor. |
| `min_height` | Number | `null` | Consulta un alto mínimo inclusivo. |
| `max_height` | Number | `null` | Consulta un alto máximo inclusivo. |
| `aspect_ratio` | Number \| Ratio | `null` | Consulta una proporción exacta. |
| `min_aspect_ratio` | Number \| Ratio | `null` | Consulta una proporción mínima inclusiva. |
| `max_aspect_ratio` | Number \| Ratio | `null` | Consulta una proporción máxima inclusiva. |
| `orientation` | Keyword | `null` | Admite `portrait` o `landscape`. |

Las claves Sass usan `snake_case`; las características generadas en CSS deben
usar guiones.

Todas las condiciones presentes en el mapa se combinan con el operador elegido.
La primera versión no necesita representar grupos anidados que mezclen `and` y
`or` en distintos niveles.

### Comportamiento del ancho predeterminado

Un mapa con `name` y sin condiciones debe usar el mismo ancho predeterminado de
la interfaz posicional:

```scss
@include container-query((name: product_list)) {
    // Styles
}
```

Debe generar una condición equivalente a:

```css
@container product_list (max-width: 1920px) {}
```

Un mapa vacío o un mapa que solo contenga opciones de control distintas de
`name` no activa este default y debe producir `@error`. Si el mapa contiene al
menos una condición explícita, no se añade `max-width: 1920px`.

### Contenedores nombrados y anónimos

Si `name` es `null`, la consulta generada no debe incluir un nombre y el
navegador seleccionará el contenedor elegible más cercano.

Si `name` tiene un valor, debe emitirse antes de las condiciones:

```css
@container product_list (min-width: 480px) {}
```

El nombre debe ser un identificador CSS válido para `container-name`. Deben
rechazarse valores vacíos, keywords globales de CSS y nombres reservados o
ambiguos para la gramática de container queries.

### Responsabilidad del consumidor

El mixin solo genera la regla `@container`. El consumidor debe establecer el
contexto de contención en el elemento ancestro correspondiente:

```scss
.product_list {
    container-name: product_list;
    container-type: inline-size;
}
```

Las consultas relacionadas con el alto pueden requerir un tipo de contención
distinto de `inline-size`. La documentación debe advertirlo, pero el mixin no
debe cambiar automáticamente las propiedades del contenedor.

## Normalización de valores

### Dimensiones

Los números sin unidad se interpretan con la unidad configurada, que es `px` de
forma predeterminada:

| Entrada | Resultado |
| --- | --- |
| `480` | `480px` |
| `480px` | `480px` |
| `30rem` | `30rem` |
| `40em` | `40em` |

No se debe concatenar una segunda unidad a una dimensión que ya tenga una.

### Proporciones

Las proporciones deben aceptar números positivos sin unidad y listas Sass con
separador `/`, como `16 / 9`. Un valor con unidad, igual a cero o negativo debe
producir `@error`.

### Orientación

`orientation` solo admite `portrait` o `landscape`.

## Operadores

- `and` es el operador predeterminado.
- `or` debe solicitarse mediante `operator: or`.
- Cualquier otro valor debe producir `@error`.
- El operador seleccionado se aplica a todas las condiciones del mapa.
- Una sola condición no debe incorporar un operador innecesario.

## Validaciones y errores

El mixin debe producir `@error` con su nombre y una explicación breve en los
siguientes casos:

1. El primer argumento no es un número ni un mapa.
2. Una dimensión no es un número Sass.
3. Una dimensión utiliza una unidad no admitida.
4. El mapa está vacío.
5. El mapa no contiene condiciones ni un nombre que active el ancho
   predeterminado.
6. El mapa contiene una clave desconocida.
7. `operator` no es `and` u `or`.
8. `orientation` no es `portrait` o `landscape`.
9. Una proporción no es válida o es menor o igual que cero.
10. `min_width` es mayor que `max_width` y Sass puede comparar las unidades.
11. `min_height` es mayor que `max_height` y Sass puede comparar las unidades.
12. `min_aspect_ratio` es mayor que `max_aspect_ratio`.
13. `name` está vacío o no representa un nombre de contenedor válido.

No se debe omitir silenciosamente una consulta inválida ni emitir `@content`
fuera de `@container` como mecanismo de recuperación.

## Compatibilidad

- La incorporación de `container-query` es aditiva.
- Ningún mixin existente cambia de nombre, firma o comportamiento.
- El mixin no comprueba soporte del navegador ni genera reglas `@supports`.
- La salida debe conservar las unidades válidas proporcionadas por el
  consumidor.

## Documentación

La implementación debe añadir una nueva sección a la página existente
`docs/pages/mediaqueries.html`. Esta pieza se clasifica como
`nueva_seccion_referencia` y continúa perteneciendo a `_mediaqueries.scss`.

Se deben crear o actualizar, como mínimo:

- `docs/components/mediaqueries/container_query.html`.
- `docs/assets/scss/mediaqueries/container_query.scss`.
- `docs/assets/css/mediaqueries/container_query.css`.
- `docs/assets/json/mediaqueries.json`.
- `docs/pages/mediaqueries.html`.
- El script de página correspondiente para inicializar el ejemplo.
- El índice de búsqueda global generado.

No se debe agregar una categoría nueva a `docs/components/global/menu.html`.

### Contenido de la sección

La sección debe:

- Identificar `container-query` como `Tipo: Mixin` y usar la versión `2.x.x`.
- Explicar la diferencia entre una media query y una container query.
- Aclarar que el mixin no sustituye a `media`, `media-range` ni `brp`.
- Documentar por separado los parámetros secuenciales y la sintaxis map.
- Explicar el comportamiento desktop-first y el default de `1920px`.
- Explicar que `container-name` y `container-type` se declaran en el contenedor.
- Advertir sobre el tipo de contención necesario para consultar el alto.
- Mostrar un único ejemplo completo mediante `TabPanel`.

El `TabPanel` debe conservar este orden:

1. `Resultado`.
2. `SCSS`.
3. `CSS generado`.
4. `HTML`.

El ejemplo debe mostrar un contenedor nombrado y un componente cuyo layout
cambie según el ancho disponible. El SCSS, el CSS generado, el HTML y el
resultado visual deben permanecer sincronizados.

La prosa y el nuevo recurso deben incorporarse al buscador global mediante la
tarea `search_index`; el índice generado no se edita manualmente.

## Verificación prevista

### Compilación Sass

Se debe comprobar como mínimo esta matriz:

| Caso | Resultado esperado |
| --- | --- |
| `container-query()` | Contenedor anónimo con `max-width: 1920px`. |
| `container-query(1200)` | Contenedor anónimo con `max-width: 1200px`. |
| `container-query(64rem)` | Conserva `max-width: 64rem`. |
| `container-query(48, product_list, rem)` | Contenedor nombrado con `max-width: 48rem`. |
| `container-query($name: product_list)` | Contenedor nombrado con `max-width: 1920px`. |
| `container-query((name: product_list))` | Contenedor nombrado con `max-width: 1920px`. |
| `container-query((min_width: 480))` | Contenedor anónimo con `min-width: 480px`. |
| `container-query((min_width: 30rem, max_width: 60rem))` | Rango inclusivo de ancho. |
| `container-query((min_height: 400, orientation: landscape))` | Alto mínimo y orientación landscape. |
| `container-query((aspect_ratio: 16 / 9))` | Condición de proporción `16 / 9`. |
| `container-query((min_width: 480, orientation: landscape, operator: or))` | Condiciones combinadas mediante `or`. |

También se deben comprobar todos los errores definidos en esta especificación y
confirmar que cada uno detenga la compilación con un mensaje identificable.

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

Se debe comprobar una consulta representativa en el buscador y confirmar que
abre `pages/mediaqueries.html` con el hash correspondiente a
`container_query`.

## Criterios de aceptación

1. Existe un mixin público `container-query` en `src/_mediaqueries.scss`.
2. La interfaz posicional genera una condición `max-width`.
3. El ancho posicional predeterminado es `1920px`.
4. Una medida unitless recibe la unidad configurada y una medida con unidad la
   conserva sin duplicarla.
5. El nombre del contenedor es opcional.
6. Proporcionar únicamente `name` usa `max-width: 1920px` tanto mediante
   argumentos nombrados como mediante mapa.
7. La sintaxis map admite dimensiones, proporciones y orientación.
8. Varias condiciones se combinan mediante `and` de forma predeterminada.
9. `operator: or` combina las condiciones mediante `or`.
10. Las configuraciones inválidas producen errores descriptivos.
11. El mixin no declara `container-name` ni `container-type`.
12. Los mixins responsive existentes conservan sus contratos.
13. La página de media queries documenta ambas interfaces por separado.
14. El ejemplo usa un contenedor nombrado y muestra un cambio visible de layout.
15. Los assets SCSS, CSS, HTML y el resultado del ejemplo están sincronizados.
16. La nueva sección aparece en el buscador global con el ancla correcta.
17. Las tareas de compilación y validación aplicables finalizan correctamente.

## Referencias normativas

- [CSS Containment Module Level 3](https://www.w3.org/TR/css-contain-3/)
- [CSS Conditional Rules Module Level 5](https://www.w3.org/TR/css-conditional-5/)
