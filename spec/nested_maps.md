# Especificación: artículo sobre mapas anidados en SISASS

## Estado

Definida para implementación.

## Historia de usuario

Como desarrollador que utiliza SISASS, quiero comprender cómo funcionan los
mapas anidados del framework, para configurar correctamente los mixins que
delegan parte de su comportamiento en otras APIs y evitar claves redundantes o
ubicadas en el nivel incorrecto.

Como mantenedor de la documentación, quiero disponer de una explicación
transversal sobre mapas anidados, para enlazarla desde las referencias de los
mixins sin repetir en cada tabla todas las claves de la API delegada.

## Objetivo

Crear un artículo autónomo llamado `Mapas anidados en SISASS` que explique:

- Qué diferencia existe entre un mapa plano y un mapa anidado.
- Cómo SISASS agrupa configuraciones relacionadas mediante mapas interiores.
- Cómo reconocer la clave contenedora y el nivel al que pertenece cada opción.
- Cómo se representan rutas anidadas en la documentación.
- Cómo intervienen los valores predeterminados, los alias y los centinelas.
- Qué diferencia existe entre reemplazar un mapa y fusionarlo.
- Qué APIs públicas de SISASS utilizan actualmente mapas anidados.

El artículo debe servir como referencia conceptual compartida. Las páginas de
cada mixin continúan siendo la fuente de verdad de sus claves y valores.

## Clasificación documental

- Tipo: artículo autónomo.
- Título: `Mapas anidados en SISASS`.
- Identificador principal: `nested_maps`.
- Ruta: `docs/pages/articles/nested_maps.html`.
- Componente: `docs/components/articles/nested_maps.html`.
- JSON: `docs/assets/json/nested_maps.json`.
- Script: `docs/assets/js/pages/nested_maps.js`.
- Categoría de navegación: artículos.
- Idioma: español.
- Versión documental: `2.x.x`.

## Decisiones confirmadas

1. El artículo será una página autónoma dentro de `docs/pages/articles/`.
2. El nombre visible será `Mapas anidados en SISASS`.
3. La ruta, el componente, el JSON, el script y los identificadores usarán
   `nested_maps`.
4. El artículo se añadirá al menú global de la documentación.
5. La audiencia principal serán desarrolladores que conocen la sintaxis básica
   de mapas Sass.
6. El contenido explicará conceptos y patrones del proyecto, pero no sustituirá
   las referencias individuales de cada mixin.
7. El inventario incluirá únicamente APIs públicas que acepten un mapa como
   valor de una de sus claves.
8. Se indicará expresamente que actualmente no existen funciones públicas de
   SISASS que reciban mapas anidados.
9. Los mapas usados solo dentro de una implementación no formarán parte del
   inventario público.
10. Los ejemplos cubrirán `replace-base`, `normalize-svg`, `img-replace` e
    `icon-svg`.
11. Los ejemplos serán bloques explicativos de SCSS y CSS, sin resultado visual
    interactivo ni `TabPanel`.
12. El artículo explicará el comportamiento relevante de `map.merge`, pero no
    será una referencia general del módulo `sass:map`.
13. La notación `position.z` se presentará como una ruta documental, no como una
    clave literal ni como sintaxis de acceso de Sass.
14. La implementación del artículo no modificará el comportamiento del código
    funcional de SISASS.
15. No se crearán estilos específicos para la página mientras los componentes
    compartidos sean suficientes.

## Alcance

### Incluido

- Página, componente, JSON y script propios para el artículo.
- Introducción a mapas planos y mapas anidados.
- Explicación de clave contenedora, mapa interior y rutas documentales.
- Explicación de valores predeterminados y del uso de `false` como centinela.
- Explicación de alias dentro de un mapa anidado.
- Diferencia entre reemplazo y fusión superficial de mapas.
- Ejemplos reales basados en las APIs actuales de SISASS.
- Tabla auditada de mixins y funciones que utilizan mapas anidados.
- Enlaces a las referencias documentales de las APIs mencionadas.
- Incorporación al menú global, breadcrumb, menú de página y buscador global.
- Validación de la navegación directa mediante hash.

### Excluido

- Cambiar interfaces o comportamiento en `src/`.
- Añadir mapas anidados a APIs que actualmente utilizan mapas planos.
- Crear una función genérica para leer rutas anidadas.
- Modificar la función `mapv`.
- Documentar exhaustivamente todos los parámetros de cada mixin mencionado.
- Duplicar las tablas completas de `position`, `background`, `replace-base` u
  otras páginas de referencia.
- Documentar todos los métodos del módulo `sass:map`.
- Incluir mapas creados únicamente como detalle interno de implementación.
- Incorporar demostraciones visuales, controles interactivos o `TabPanel`.
- Crear SCSS o CSS específico para la página si los estilos compartidos cubren
  su contenido.

## Definiciones documentales

### Mapa plano

Un mapa plano contiene claves cuyos valores son datos finales para la API que
recibe el mapa:

```scss
(
    width: 140px,
    display: block
)
```

### Mapa anidado

Un mapa anidado contiene al menos una clave cuyo valor es otro mapa:

```scss
(
    width: 140px,
    position: (
        position: relative,
        z: 2
    )
)
```

En este ejemplo, el primer `position` es la clave contenedora reconocida por
`replace-base`. El segundo `position` y `z` pertenecen al mapa interior que se
procesa con la sintaxis del mixin `position`.

### Notación de rutas

La documentación puede representar una clave interior mediante una ruta con
puntos:

| Ruta documental | Significado |
| --- | --- |
| `position.z` | Clave `z` dentro del mapa `position`. |
| `base.position` | Clave `position` dentro del mapa `base`. |
| `base.position.z` | Clave `z` dentro de `position`, que a su vez está dentro de `base`. |

La notación con puntos se usa únicamente para explicar la jerarquía. No debe
mostrarse como una clave literal equivalente a `"position.z"` ni como sintaxis
de acceso válida de Sass.

## Contenido requerido

### Introducción

La introducción debe explicar por qué SISASS utiliza mapas anidados: agrupar una
configuración especializada y delegarla a otro mixin sin llevar todas sus
claves al nivel exterior.

Debe comparar una API con claves planas y una API con una clave contenedora,
sin presentar el anidamiento como obligatorio para todos los mixins basados en
mapas.

### Claves contenedoras y APIs delegadas

El artículo debe explicar que una clave contenedora tiene contrato propio:

- Puede aceptar exclusivamente un mapa, como `position` en `replace-base`.
- Puede ser opcional y utilizar `false` para desactivar el bloque completo.
- Sus claves interiores siguen la sintaxis de la API delegada.
- Los alias deben interpretarse dentro del nivel donde están documentados.
- Una clave con el mismo nombre en niveles diferentes no representa
  necesariamente el mismo dato.

La explicación debe advertir que mover una clave interior al nivel exterior no
es equivalente. Por ejemplo, `z` pertenece a `position` en `replace-base`; un
`z` exterior no forma parte de esa API.

### Valores predeterminados y centinelas

El artículo debe diferenciar entre:

- Un valor predeterminado que se utiliza cuando una clave interior no existe.
- Un centinela como `false`, que desactiva una configuración opcional.
- Un valor explícito proporcionado por el consumidor.

Debe utilizar `replace-base` para explicar que `position: false` desactiva el
bloque de posición y que `position.z: false` evita generar `z-index` sin
desactivar las demás propiedades de posición.

Debe utilizar `normalize-svg` para explicar que su configuración predeterminada
incluye `position: relative` y `position.z: 2`, y que personalizar una sola
clave del mapa de posición conserva los demás valores definidos por el wrapper.

### Alias

Los alias se deben explicar dentro de su nivel correspondiente. El artículo
debe mostrar que:

```scss
position: (
    p: absolute,
    t: 0,
    l: 0
)
```

usa alias del mapa interior de `position`. No debe sugerir que esos alias se
pueden trasladar automáticamente al mapa exterior.

Cuando una API defina precedencia entre una clave principal y su alias, el
artículo debe remitir a su página de referencia para conocer el contrato exacto.

### Fusión y reemplazo

El artículo debe explicar que `map.merge` realiza una fusión superficial. Si
ambos mapas contienen la misma clave contenedora, el valor completo de esa
clave es reemplazado:

```scss
$defaults: (
    position: (
        position: relative,
        z: 2
    )
);

$custom: (
    position: (
        top: 10px
    )
);

$result: map.merge($defaults, $custom);
```

El artículo debe aclarar que, en ese resultado, el mapa `position` de
`$custom` reemplaza el mapa `position` de `$defaults`; no se conserva
automáticamente `position: relative` ni `z: 2`.

La explicación puede mencionar que una API puede preservar valores internos
mediante una fusión específica, como hace `normalize-svg`, pero no debe prometer
fusión profunda para todos los mapas anidados de SISASS.

## Inventario de APIs

El artículo debe incluir esta tabla, contrastada con el código fuente vigente
durante la implementación:

| Tipo | API pública | Clave anidada | API o comportamiento interior | Ruta fuente |
| --- | --- | --- | --- | --- |
| Mixin | `replace-base` | `position \| p` | Reutiliza la sintaxis map de `position`. | `src/_base.scss` |
| Mixin | `normalize-svg` | `position \| p` | Configura la posición de `replace-base` y conserva `z: 2` como valor predeterminado. | `src/_base.scss` |
| Mixin | `icon-svg` | `position` | Reutiliza las opciones de posicionamiento admitidas por `position`. | `src/_base.scss` |
| Mixin | `icon-svg` | `background` | Agrupa `repeat`, `position`, `color` y `size` para construir el fondo del SVG. | `src/_base.scss` |
| Mixin | `img-replace` | `base` | Envía la configuración interior a `replace-base`; puede contener otro nivel como `base.position`. | `src/_base.scss` |

`img-remplace` es un alias de compatibilidad de `img-replace` y no debe
contarse como una API anidada independiente.

### Funciones

El artículo debe indicar de forma explícita:

> Actualmente, SISASS no expone funciones públicas cuya configuración requiera
> mapas anidados.

Funciones como `bp`, `pb` y `mapv` reciben o procesan mapas planos. Los mapas
internos usados para implementar una función no convierten su interfaz pública
en una API de mapas anidados.

Antes de publicar el artículo, el inventario debe volver a comprobarse contra
todo `src/`. Si aparece una nueva API pública con un mapa anidado, debe añadirse
a la tabla; no se deben incorporar coincidencias que sean únicamente mapas
internos o mapas planos.

## Ejemplos requeridos

### `replace-base`

Debe mostrar una configuración con `position.z` y contrastarla con un `z`
exterior incorrecto:

```scss
.correct {
    @include replace-base((
        position: (
            position: relative,
            z: 2
        )
    ));
}
```

El texto debe explicar que `position` es el contenedor y que `z` pertenece al
mapa interior.

### `normalize-svg`

Debe mostrar la sobrescritura parcial de posición:

```scss
.icon {
    @include normalize-svg((
        position: (
            top: 4px
        )
    ));
}
```

La explicación debe indicar que el wrapper conserva sus valores interiores
predeterminados, incluido `z: 2`.

### `img-replace`

Debe mostrar al menos dos niveles de anidamiento:

```scss
.logo {
    @include img-replace((
        image: "../img/logo.svg",
        base: (
            position: (
                position: relative,
                z: 3
            )
        )
    ));
}
```

El artículo debe identificar las rutas documentales `base.position` y
`base.position.z`.

### `icon-svg`

Debe mostrar los mapas hermanos `position` y `background` dentro de una sola
llamada:

```scss
&::before {
    @include icon-svg((
        svg: "arrow",
        position: (
            p: absolute,
            t: 0,
            l: 0
        ),
        background: (
            repeat: no-repeat,
            position: center,
            size: contain
        )
    ));
}
```

La explicación debe distinguir `position.position` de
`background.position`, aunque ambas claves interiores se llamen `position`.

Los ejemplos deben reflejar el comportamiento real del código al implementar
el artículo. No requieren archivos SCSS o CSS independientes, resultado visual
ni inicialización de `TabPanel`.

## Estructura editorial

El componente debe contener, como mínimo, las siguientes secciones:

1. Introducción.
2. Mapas planos y mapas anidados.
3. Claves contenedoras y rutas documentales.
4. Valores predeterminados, centinelas y alias.
5. Fusión y reemplazo de mapas.
6. Mixins y funciones que utilizan mapas anidados.
7. Ejemplos del proyecto.
8. Recomendaciones y errores frecuentes.

Los encabezados principales deben tener identificadores estables basados en
`nested_maps` y usar `data-page-menu-item`. Los encabezados secundarios solo se
marcarán cuando mejoren realmente la navegación y siempre estarán subordinados
a un `h2` válido.

El bloque `group_title` debe mostrar:

- Título: `Mapas anidados en SISASS`.
- Tipo: `Artículo`.
- Versión: `2.x.x`.

La prosa debe usar `map` para identificadores o sintaxis y “mapa” para la
explicación en español. Los identificadores técnicos, nombres de mixins, claves
y rutas conservarán su escritura original.

## Navegación y descubrimiento

### Página y carga

La página debe seguir la estructura de los artículos existentes y cargar su
componente mediante `contentLoad`. Debe incluir el `aside` compartido
`#sidebar_menu` antes de `#main_content`.

El script debe inicializar, después de cargar el contenido:

- Menú de la página actual.
- Breadcrumb.
- Navegación mediante hash.
- Buscador global.
- Estados correspondientes del loader.

### Breadcrumb

El JSON debe declarar manualmente:

```json
{
    "breadcrumb": [
        {
            "label": "articles"
        },
        {
            "label": "nested_maps.html"
        }
    ]
}
```

El componente se registrará mediante un identificador y nodo `nested_maps`.

### Menú global

El menú global debe incorporar un enlace visible hacia el artículo usando las
convenciones existentes. El enlace debe apuntar a
`../pages/articles/nested_maps.html` y disponer de un identificador estable
coherente con `nested_maps`.

### Buscador global

El artículo debe indexarse mediante la tarea existente. Como mínimo, debe ser
localizable por:

- `map anidado`
- `mapas anidados`
- `position.z`
- `base.position`
- `map.merge`
- `replace-base`
- `normalize-svg`
- `img-replace`
- `icon-svg`

Cada resultado debe abrir `pages/articles/nested_maps.html` y el hash de la
sección correspondiente. El archivo generado
`docs/assets/json/components/search_index.json` no debe editarse manualmente.

## Archivos esperados

| Archivo | Responsabilidad |
| --- | --- |
| `docs/pages/articles/nested_maps.html` | Contenedor HTML de la página autónoma. |
| `docs/components/articles/nested_maps.html` | Contenido completo del artículo. |
| `docs/assets/json/nested_maps.json` | Breadcrumb y registro del componente. |
| `docs/assets/js/pages/nested_maps.js` | Carga, menú de página, hash, breadcrumb, búsqueda y loader. |
| `docs/components/global/menu.html` | Acceso al artículo desde el menú global. |
| `docs/assets/json/components/search_index.json` | Índice de búsqueda regenerado. |

No se esperan archivos propios en `docs/assets/scss/pages/` ni
`docs/assets/css/pages/`. Si durante la implementación se demuestra que los
estilos compartidos son insuficientes, esa necesidad debe justificarse antes de
añadirlos.

## Criterios de aceptación

1. Existe `docs/pages/articles/nested_maps.html` y carga correctamente el
   componente `nested_maps`.
2. El artículo se titula `Mapas anidados en SISASS` y está redactado en español.
3. El artículo diferencia claramente mapas planos y mapas anidados.
4. La clave contenedora y sus claves interiores se explican con ejemplos reales
   de SISASS.
5. `position.z` se define como notación documental y no como clave literal o
   sintaxis de acceso Sass.
6. Se explica la diferencia entre un valor predeterminado y un centinela.
7. Se explica que `position: false` desactiva el bloque completo y que
   `position.z: false` solo evita generar `z-index`.
8. Se explica que los alias pertenecen al nivel donde están definidos.
9. Se explica que `map.merge` realiza una fusión superficial y puede reemplazar
   un mapa interior completo.
10. El artículo no promete fusión profunda como comportamiento general de
    SISASS.
11. La tabla incluye `replace-base`, `normalize-svg`, `icon-svg` e
    `img-replace`, con todas sus claves anidadas públicas vigentes.
12. La tabla no incluye APIs que solo reciben mapas planos ni mapas internos de
    implementación.
13. El artículo indica que actualmente no existen funciones públicas con mapas
    anidados.
14. Los ejemplos cubren los cuatro mixins inventariados y coinciden con el
    comportamiento real del código fuente.
15. El artículo enlaza a las páginas de referencia de las APIs mencionadas.
16. No se duplican las tablas completas de parámetros de otros mixins.
17. La página aparece en el menú global.
18. El breadcrumb muestra `articles / nested_maps.html`.
19. El menú de la página se construye desde encabezados explícitamente
    seleccionados y conserva su jerarquía.
20. Los enlaces directos con hash abren la sección correcta después de la carga
    asíncrona.
21. El buscador encuentra consultas representativas y abre la página con el
    hash correspondiente.
22. La implementación no modifica el comportamiento funcional de SISASS.
23. La página funciona con los estilos compartidos y sin `TabPanel`.
24. Las tareas de compilación y validación documental aplicables finalizan sin
    errores.

## Verificación requerida

- Auditar `src/` para confirmar el inventario antes de publicar el artículo.
- Verificar que cada ejemplo compile y refleje el comportamiento descrito.
- Comprobar que la página y el componente carguen sin errores.
- Validar la navegación por clic y mediante hashes directos.
- Validar el menú de página en escritorio, móvil e impresión.
- Confirmar que el breadcrumb manual muestre la ruta prevista.
- Ejecutar `npm exec gulp lint` desde `docs/`.
- Ejecutar `npm exec gulp search_index` desde `docs/`.
- Ejecutar `npm exec gulp jsonlint` desde `docs/`.
- Ejecutar `npm exec gulp scss` únicamente si la implementación afecta SCSS o
  necesita regenerar CSS.
- Inspeccionar al menos una consulta representativa en
  `docs/assets/json/components/search_index.json`.
- Si `docs/package.json` incorpora un script `test`, ejecutar también
  `npm run test` desde `docs/`.

