# Especificación: clasificación de mixins de media queries

## Estado

Implementada.

## Historia de usuario

Como desarrollador que consulta la documentación de SISASS, quiero encontrar
una clasificación general de los mixins de media queries, para identificar con
rapidez qué utilidad corresponde a dimensiones, orientación, rangos, consultas
avanzadas, contenedores o múltiples breakpoints.

## Objetivo

Incorporar en `docs/pages/mediaqueries.html` una clasificación que agrupe los
mixins públicos documentados según su propósito. La descripción general debe
mostrar una tabla como índice visual y cada grupo de referencias debe tener un
título de categoría. El menú lateral debe contener únicamente los mixins.

## Decisiones confirmadas

1. La tabla aparecerá en la descripción general, antes de la documentación
   individual de los mixins.
2. La clasificación utilizará seis categorías: dimensiones del viewport,
   orientación, rangos, consultas avanzadas, consultas de contenedor y
   breakpoints múltiples.
3. `brpp` pertenecerá a orientación porque restringe la consulta a
   `portrait`, aunque evalúe la altura del viewport.
4. `brpl` pertenecerá a orientación porque restringe la consulta a
   `landscape`, aunque evalúe el ancho del viewport.
5. La tabla incluirá únicamente los mixins públicos documentados.
6. Cada mixin enlazará con su sección dentro de
   `docs/pages/mediaqueries.html`.
7. El encabezado `Clasificación de mixins` no aparecerá en el menú lateral de
   la página.
8. La tabla formará parte del componente de descripción general existente; no
   se creará un componente independiente.
9. No se modificarán las interfaces ni el comportamiento SCSS de los mixins.
10. La documentación y esta especificación se redactarán en español.
11. Cada categoría tendrá un título visible antes de sus referencias, siguiendo
    el patrón de `docs/pages/base.html`.
12. Los títulos de categoría no aparecerán en el menú lateral.
13. Las referencias se ordenarán dentro de la página según la clasificación
    funcional definida en esta especificación.
14. El menú lateral mostrará únicamente los nueve mixins públicos.
15. Las etiquetas del menú usarán los nombres públicos exactos, incluidos
    `media-range` y `container-query` con guion medio.

## Clasificación funcional

La tabla debe presentar exactamente la siguiente clasificación:

| Categoría | Mixins |
| --- | --- |
| Dimensiones del viewport | `brp`, `brph`, `brpwh` |
| Orientación | `brpp`, `brpl` |
| Rangos | `media-range` |
| Consultas avanzadas | `media` |
| Consultas de contenedor | `container-query` |
| Breakpoints múltiples | `mbr` |

Los helpers internos, incluido `_media_single_axis`, no deben aparecer en la
tabla.

## Alcance

### Incluido

- Añadir la sección `Clasificación de mixins` al componente
  `docs/components/mediaqueries/overview.html`.
- Ubicar la sección después de los párrafos introductorios del componente.
- Presentar la clasificación mediante una tabla con las columnas `Categoría`
  y `Mixins`.
- Envolver la tabla en un contenedor `container_table` y aplicar la clase
  `full` a la tabla.
- Convertir cada nombre de mixin en un enlace con la clase `link` y el hash de
  su sección correspondiente.
- Añadir en `docs/pages/mediaqueries.html` un título visible antes de cada
  grupo mediante un `h2` con la clase `category`.
- Reordenar las referencias para que cada mixin aparezca inmediatamente después
  del título de su categoría.
- Limitar el menú lateral a los nueve mixins públicos.
- Mantener actualizada la información indexable del buscador global.
- Revisar la redacción española de la sección modificada.

### Excluido

- Crear una página, componente, script o archivo JSON independiente para la
  clasificación.
- Añadir el encabezado de clasificación al menú lateral.
- Modificar `src/_mediaqueries.scss` o cualquier API pública de los mixins.
- Incluir funciones o mixins privados de implementación.
- Crear categorías nuevas en el menú global de la documentación.

## Requisitos documentales

### Encabezado

La tabla debe estar precedida por un bloque `group_title` cuyo encabezado
visible sea `Clasificación de mixins`. Este encabezado no debe declarar
`data-page-menu-item`.

### Tabla

La estructura visible debe usar los siguientes encabezados, en este orden:

1. `Categoría`.
2. `Mixins`.

Los enlaces deben conservar los nombres públicos exactos y apuntar a estos
identificadores:

| Mixin | Destino |
| --- | --- |
| `brp` | `../pages/mediaqueries.html#brp` |
| `brph` | `../pages/mediaqueries.html#brph` |
| `brpwh` | `../pages/mediaqueries.html#brpwh` |
| `brpp` | `../pages/mediaqueries.html#brpp` |
| `brpl` | `../pages/mediaqueries.html#brpl` |
| `media-range` | `../pages/mediaqueries.html#media_range` |
| `media` | `../pages/mediaqueries.html#media` |
| `container-query` | `../pages/mediaqueries.html#container_query` |
| `mbr` | `../pages/mediaqueries.html#mbr` |

### Títulos de categoría

Cada grupo debe comenzar con un título `Categoría: <nombre>` y utilizar un ID
estable. Estos títulos no deben declarar `data-page-menu-item` ni
`data-page-menu-label`:

| Categoría | ID |
| --- | --- |
| Dimensiones del viewport | `mediaqueries_viewport_dimensions` |
| Orientación | `mediaqueries_orientation` |
| Rangos | `mediaqueries_ranges` |
| Consultas avanzadas | `mediaqueries_advanced_queries` |
| Consultas de contenedor | `mediaqueries_container_queries` |
| Breakpoints múltiples | `mediaqueries_multiple_breakpoints` |

## Integración documental

- `docs/pages/mediaqueries.html` continuará componiéndose mediante
  `docs/assets/json/mediaqueries.json` y el componente `overview.html` ya
  registrado.
- Los títulos de categoría se añadirán directamente al HTML de la página. No se
  crearán contenedores de contenido ni entradas nuevas en el arreglo
  `components` del JSON.
- El buscador global debe incorporar el encabezado, las categorías y los
  nombres visibles de la tabla mediante la regeneración de
  `docs/assets/json/components/search_index.json`.
- El menú lateral debe mostrar solamente los encabezados de los nueve mixins,
  marcados explícitamente con `data-page-menu-item` en sus componentes.
- La descripción general, la clasificación y los títulos de categoría deben
  permanecer fuera del menú lateral.

## Criterios de aceptación

1. La descripción general de media queries muestra el encabezado
   `Clasificación de mixins` después de sus párrafos introductorios.
2. La tabla presenta las columnas `Categoría` y `Mixins`.
3. Los nueve mixins públicos aparecen una sola vez y dentro de la categoría
   definida en esta especificación.
4. No aparecen helpers internos ni APIs que no tengan una referencia pública
   en la página.
5. Todos los enlaces tienen la clase `link` y abren la sección correcta sin
   abandonar `mediaqueries.html`.
6. El encabezado de clasificación no aparece en el menú lateral.
7. Cada grupo de referencias está precedido por su título de categoría.
8. Los seis títulos de categoría no aparecen en el menú lateral.
9. Las referencias aparecen agrupadas según la clasificación funcional.
10. El menú lateral contiene exactamente los nueve mixins públicos y no incluye
    la descripción general.
11. La tabla conserva el comportamiento responsive compartido de las tablas de
   documentación.
12. El buscador global encuentra el contenido actualizado y dirige a la página
   de media queries.
13. La compilación y las validaciones documentales disponibles finalizan sin
   errores atribuibles al cambio.
14. No cambia el código ni el CSS generado por los mixins de
    `src/_mediaqueries.scss`.

## Verificación

- Regenerar el índice con `npm exec gulp search_index` desde `docs/`.
- Validar el JSON con `npm exec gulp jsonlint` desde `docs/`.
- Ejecutar `npm exec gulp lint` desde `docs/`.
- Ejecutar la validación HTML disponible para la documentación.
- Comprobar al menos un enlace de cada categoría y confirmar que mantiene la
  ruta actual y aplica el hash esperado.
- Confirmar que la descripción general, `Clasificación de mixins` y los seis
  títulos de categoría no se incorporan al menú lateral.
- Confirmar que el menú lateral contiene únicamente los nueve mixins públicos.
- Si `docs/package.json` incorpora un script `test`, ejecutar también
  `npm run test` desde `docs/`.
