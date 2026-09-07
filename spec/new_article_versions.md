# Especificación: historial de versiones del artículo de novedades

## Estado

Implementada.

## Historia de usuario

Como lector de la documentación de SISASS, quiero consultar las novedades de
varias versiones desde una única página, para revisar tanto los cambios más
recientes como el historial de versiones anteriores.

Como mantenedor de la documentación, quiero que cada versión tenga su propio
bloque de contenido, para añadir nuevas publicaciones sin convertir el artículo
en un único archivo difícil de mantener.

## Objetivo

Evolucionar `docs/pages/articles/new.html` desde un artículo de una sola versión
hacia una página histórica que cargue varias versiones en el mismo sitio,
siguiendo el patrón de secciones y componentes de `docs/pages/base.html`.

La página debe conservar el contenido actual de la versión `2.0.1` y permitir
añadir versiones posteriores sin perder ni ocultar las anteriores.

## Clasificación documental

- Tipo: página autónoma de artículo histórico.
- Categoría de navegación: novedades.
- Idioma: español.
- Página existente: `docs/pages/articles/new.html`.
- JSON de página: `docs/assets/json/new.json`.
- Script de página: `docs/assets/js/pages/new.js`.
- Versión inicial conservada: `2.0.1`.

## Decisiones confirmadas

1. Se mantiene una única página principal para todas las novedades.
2. Las versiones se muestran en orden descendente: la más reciente primero.
3. Todas las versiones permanecen visibles en la misma página.
4. Cada versión se representa mediante un componente HTML independiente.
5. El JSON de la página registra cada componente y su punto de montaje.
6. El contenido publicado de una versión es histórico y no cambia al añadir
   versiones nuevas, salvo correcciones editoriales explícitas.
7. Cada versión tiene un identificador estable y navegable mediante hash.
8. La convención de identificadores de versión usa el número normalizado, por
   ejemplo `version_2_0_1`.
9. El menú de la página muestra una entrada por versión y puede incluir las
   subsecciones seleccionadas de cada versión.
10. El buscador global puede devolver resultados de cada versión individual.
11. La URL existente `new.html` continúa siendo la entrada al historial general.
12. No se incorpora filtrado, paginación, acordeón ni pestañas para cambiar de
    versión.
13. El formato visible de versión sigue el esquema actual, como `2.0.1`, sin
    establecer reglas adicionales de versionado.

## Alcance

### Incluido

- Separación de la versión `2.0.1` en su propio componente, conservando su
  contenido.
- Estructura de la página para montar múltiples versiones.
- Registro de las versiones en `docs/assets/json/new.json`.
- Anclas estables para cada versión.
- Integración con el menú de la página actual.
- Integración con navegación directa mediante hash.
- Indexación individual de las versiones en el buscador global.
- Actualización de los assets generados cuando la implementación los afecte.
- Validación de carga, navegación, buscador y enlaces directos.

### Excluido

- Crear una página HTML independiente para cada versión.
- Rediseñar visualmente el artículo de novedades sin una necesidad derivada.
- Implementar filtros por versión, categoría o tipo de cambio.
- Ocultar automáticamente versiones antiguas.
- Añadir una API o un formato de datos nuevo para las publicaciones.
- Cambiar el contenido funcional de la versión `2.0.1`.
- Definir o modificar las reglas de versionado semántico de SISASS.

## Estructura de versiones

Cada versión debe formar una unidad documental independiente con, como mínimo:

- Título visible con el número de versión.
- Número de versión dentro de los atributos documentales existentes.
- Introducción breve de la publicación.
- Una o más secciones de cambios, como correcciones, mejoras o nuevas
  capacidades.
- Un identificador estable para navegación y búsqueda.

Los componentes deben ubicarse en `docs/components/articles/` y usar nombres
que permitan identificar la versión, por ejemplo:

```text
docs/components/articles/new_2_0_1.html
docs/components/articles/new_2_0_2.html
```

La página debe declarar un punto de montaje por versión. El identificador del
punto de montaje y el componente deben ser únicos dentro de `new.html`.

## Orden y presentación

- La versión más reciente aparece primero.
- La versión `2.0.1` debe continuar mostrando el contenido actualmente
  publicado.
- Las versiones anteriores permanecen debajo de las más recientes.
- No se requiere interacción para revelar el contenido de una versión.
- La presentación debe conservar los estilos y patrones visuales actuales del
  artículo, salvo los ajustes mínimos necesarios para distinguir bloques.

## Menú de la página y navegación

- Cada versión debe tener un encabezado navegable con `id` estable y
  `data-page-menu-item` cuando corresponda al menú.
- Los identificadores no deben depender de texto generado automáticamente.
- Un enlace a `new.html#version_2_0_1` debe llevar directamente a la versión
  `2.0.1` después de completar la carga asíncrona.
- El menú debe conservar la ruta actual y añadir únicamente el hash.
- El scroll manual debe actualizar la sección activa sin reemplazar el hash de
  la URL.
- Las subsecciones internas solo deben aparecer en el menú si están marcadas
  explícitamente y cumplen las reglas del menú de página.
- Los encabezados internos de `TabPanel`, si existieran en el contenido, no se
  deben incorporar al menú.

## Buscador global

- Cada versión debe quedar asociada a la página `pages/articles/new.html`.
- Los resultados deben conservar un ancla que abra la versión o sección
  correspondiente.
- El texto indexable debe incluir el título, número de versión y contenido
  visible relevante.
- La generación del índice debe realizarse con la tarea existente de búsqueda;
  `docs/assets/json/components/search_index.json` no se edita manualmente.
- Los cambios en títulos, anclas o prosa indexable deben validarse con
  `search_index` y `jsonlint`.

## Archivos esperados

| Archivo | Responsabilidad |
| --- | --- |
| `docs/pages/articles/new.html` | Contenedor de la página y puntos de montaje de las versiones. |
| `docs/assets/js/pages/new.js` | Carga del JSON, menú, breadcrumb, navegación por hash y buscador. |
| `docs/assets/json/new.json` | Registro ordenado de los componentes de cada versión. |
| `docs/components/articles/new_2_0_1.html` | Contenido histórico de la versión `2.0.1`. |
| `docs/components/articles/new_<version>.html` | Contenido de cada versión posterior. |
| `docs/assets/json/components/search_index.json` | Índice de búsqueda generado por la tarea documental. |

## Criterios de aceptación

1. `new.html` carga correctamente la versión `2.0.1` mediante el mecanismo de
   componentes existente.
2. El contenido visible de `2.0.1` coincide con el artículo actual antes de la
   migración.
3. Es posible añadir una segunda versión registrando un nuevo componente y su
   punto de montaje, sin fusionar su contenido con el componente anterior.
4. Las versiones aparecen de la más reciente a la más antigua.
5. Todas las versiones cargadas permanecen visibles al mismo tiempo.
6. Cada versión tiene un hash estable y una URL directa funcional.
7. La navegación por hash no abandona `new.html` ni se redirige hacia
   `docs/assets/` por efecto de la etiqueta `base`.
8. El menú de la página muestra las versiones válidas y respeta la jerarquía de
   sus subsecciones.
9. El buscador global encuentra contenido de al menos una versión y abre la
   página en el ancla correcta.
10. La página continúa funcionando con la URL actual sin parámetros especiales.
11. La implementación pasa las validaciones documentales y las comprobaciones
    de compilación aplicables al sitio.

## Verificación requerida

- Ejecutar la compilación o tareas de documentación afectadas desde `docs/`.
- Ejecutar `npm exec gulp lint`.
- Ejecutar `npm exec gulp search_index` cuando cambien componentes o texto
  indexable.
- Ejecutar `npm exec gulp jsonlint` después de regenerar JSON.
- Verificar en el navegador la carga de varias versiones, el orden, los hashes,
  el menú y el buscador.
- Comprobar que el contenido de los paneles o ejemplos existentes continúa
  sincronizado con sus assets.
