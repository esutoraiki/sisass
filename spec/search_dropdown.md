# Especificación: desplegable de búsqueda global

## Estado

Implementada y validada en Opera conforme a los criterios de aceptación.
La interfaz de referencia es la imagen suministrada en la conversación.

## Historia de usuario

Como lector de la documentación de SISASS, quiero consultar resultados desde
el buscador del encabezado, reconocer su tipo y ubicación y abrir la sección
correspondiente mediante ratón o teclado.

Cuando existan más coincidencias que las mostradas inicialmente, quiero verlas
en el mismo desplegable mediante scroll, conservando el área inicial del panel.

## Decisiones confirmadas

1. La búsqueda abarca toda la documentación. No se amplía al catálogo de
   utilidades JavaScript ni a la búsqueda directa en archivos del repositorio.
2. La vista inicial contiene como máximo cinco resultados y un contador del
   total de coincidencias.
3. «Ver todos los resultados» mantiene el área del desplegable inicial y
   permite recorrer la lista completa con scroll interno.
4. El espacio de la barra de scroll debe reservarse mediante CSS desde la
   vista inicial, para evitar desplazamientos horizontales al mostrarla.
5. Se reutilizan exclusivamente iconos existentes. Si falta algún recurso,
   se solicita al desarrollador; no se crean iconos.
6. La interfaz y esta especificación se redactan en español. Los identificadores
   técnicos conservan su nombre original.

## Alcance

### Incluido

- Buscador compartido de la documentación, su campo y su desplegable.
- Cabecera con consulta y total real de coincidencias.
- Resultados con icono, título, origen, tipo, extracto y ruta.
- Resaltado de coincidencias y selección de resultados con teclado.
- Botón para limpiar y acceso a todos los resultados dentro del panel.
- Estados de carga, lista vacía, error y búsqueda limitada a la página actual.
- Adaptación a móvil, tema claro, tema oscuro y accesibilidad.
- Ampliación de metadatos del índice documental existente.
- Sincronización y verificación de los assets afectados al implementar.

### Excluido

- Crear un catálogo de utilidades JavaScript o indexar código sin documentación.
- Añadir los recursos ficticios, rutas o cantidades de la imagen al contenido.
- Rediseñar el encabezado completo, los menús laterales o los artículos.
- Resaltar términos en el contenido de fondo de la página.
- Crear una página de resultados, modal, paginación o nueva ruta de búsqueda.
- Añadir historial, sugerencias con el campo vacío o un servicio remoto.
- Crear o dibujar iconos, incluso mediante CSS, SVG o caracteres sustitutivos.

## Situación actual y puntos de integración

`docs/assets/js/core/search.js` carga el índice global, normaliza mayúsculas y
tildes, calcula relevancia y limita el resultado a doce entradas. También
dispone de búsqueda local de respaldo y los atajos `/` y `Ctrl/⌘ K`.

El marcado compartido vive en `docs/components/global/header.html`; las filas
se crean desde `docs/templates/templates.html`. Los estilos del buscador están
en `docs/assets/scss/components/_page_search.scss`.

La ruta efectiva del índice, compartida por el generador y el consumidor, es
`docs/assets/json/components/search_index.json`. Debe conservarse aunque las
instrucciones generales mencionen `docs/assets/json/search_index.json`.
El archivo se regenera mediante la tarea `search_index`; no se edita a mano.

El generador recorre las páginas de `docs/pages/`, sus JSON homónimos y los
componentes registrados. Esta estructura sigue siendo la fuente de verdad de
la búsqueda documental. Las rutas y los hashes existentes se conservan.

## Estructura visual

### Campo de búsqueda

- Lupa existente al inicio del campo.
- Texto de ayuda «Buscar en la documentación...», también coherente con su
  etiqueta accesible y la etiqueta visible en móvil.
- Botón «Limpiar búsqueda» visible únicamente cuando el campo contiene texto.
- Separación visual entre el botón de limpiar y la indicación del atajo.
- Indicador `⌘ K` en macOS y `Ctrl K` en los demás sistemas.
- Bordes, superficies y foco coherentes con el tema activo.

### Panel

En escritorio, el panel aparece debajo del campo, centrado respecto a este y
con mayor anchura cuando el espacio lo permite. Debe respetar los márgenes del
viewport. Conserva la composición de la imagen: borde tenue, sombra, esquinas
redondeadas y filas separadas mediante espacio.

El panel consta de cabecera, región de resultados y pie. La cabecera muestra
«Resultados para “consulta”» y el total con singular o plural correcto.

Cada fila contiene, en este orden visual:

1. Icono dentro de una superficie compacta.
2. Nombre del recurso y archivo de origen entre paréntesis, cuando exista.
3. Etiqueta del tipo documental.
4. Extracto breve, truncado visualmente cuando sea necesario.
5. Ruta informativa y flecha de navegación a la derecha en escritorio.

La fila activa utiliza una superficie diferenciada. El foco de teclado debe
seguir siendo reconocible y no depender exclusivamente del color.

### Vista inicial y lista completa

- La vista inicial muestra las primeras cinco coincidencias o todas si hay menos.
- El total se calcula antes de limitar la vista; nunca representa solo las
  entradas renderizadas ni conserva el límite anterior de doce.
- Si el total supera cinco, aparece «Ver todos los resultados para “consulta”»
  y su indicación `Ctrl/⌘ Enter`.
- Al activarlo se muestran todas las coincidencias, conservando consulta,
  orden, selección y dimensiones del panel para el viewport actual.
- La lista completa ocupa la misma región de resultados que la vista inicial.
  El contenido adicional se recorre verticalmente dentro de esa región.
- La cabecera y el pie permanecen fuera del área desplazable. En la vista
  completa, el pie indica «Mostrando todos los resultados» y deja de ofrecer
  la acción ya ejecutada y su atajo.
- Modificar la consulta restablece la vista inicial, selecciona el primer
  resultado y devuelve el scroll de la lista al inicio.
- Con cinco coincidencias o menos no se ofrece «Ver todos».

La geometría debe resolverse con CSS: región de resultados con altura acotada,
`overflow-y: auto` y `scrollbar-gutter: stable` desde el estado inicial. El mismo
elemento conserva esa reserva al pasar a la lista completa. No se calcula el
ancho de la barra con JavaScript ni se cambia el ancho del panel al activarla.

Con barras superpuestas del sistema puede no verse un canal permanente; el
criterio funcional sigue siendo que no exista desplazamiento horizontal. En
pantallas bajas, la lista inicial también puede necesitar scroll para que
ningún resultado quede inaccesible. La aparición de ese scroll no muestra
automáticamente las coincidencias posteriores a la quinta.

## Consulta, coincidencias y orden

- La búsqueda comienza con el primer carácter distinto de espacio.
- Un campo vacío o compuesto solo por espacios cierra los resultados.
- Se mantiene la normalización actual de mayúsculas, tildes y espacios.
- Una consulta de varias palabras exige que todas encuentren coincidencia en
  los campos de búsqueda actuales: título, categoría o texto documental.
- Se conserva la prioridad actual: inicio del título, contenido del título,
  categoría y cuerpo documental. Los empates conservan el orden del índice.
- La vista inicial y la completa se derivan de una misma lista ordenada.
- Los nuevos metadatos de presentación no cambian por sí mismos la relevancia.

El resaltado se aplica a las coincidencias del nombre y el extracto. Debe
conservar las tildes y la escritura original, con énfasis en el título y fondo
suave en el extracto, siguiendo la referencia y adaptándose al tema.

La consulta se trata como texto literal. No se inserta como HTML ni se
interpreta como expresión regular. La normalización usada para encontrar
coincidencias debe mantener una correspondencia con las posiciones originales
para no cortar ni resaltar caracteres incorrectos.

## Datos de cada resultado

Se conservan `url`, `anchor`, `title`, `category`, `page_title` y `text` del
índice actual. El generador puede añadir los siguientes campos de presentación:

| Campo | Uso |
| --- | --- |
| `display_title` | Nombre visible sin repetir el archivo de origen. |
| `source_file` | Archivo de origen documentado; se omite si no está identificado. |
| `display_path` | Ruta fuente comprobada o ruta de la página documental. |
| `icon` | Nombre de un icono existente perteneciente al conjunto admitido. |

Los metadatos se obtienen del bloque `group_title`, el breadcrumb y la
información explícita de los JSON documentales. Si hace falta completar un dato,
se registra en la fuente documental correspondiente, no en el índice generado.

No se deducen rutas ficticias a partir de la imagen ni se confunde la ubicación
del fragmento HTML con el archivo fuente que documenta. Los nombres de origen
se contrastan con archivos reales sin modificar en bloque la nomenclatura de
los artículos existentes. Cuando no pueda identificarse el origen, se omite
`source_file` y se muestra la ruta de la página documental.

Las etiquetas visibles se presentan en español; por ejemplo, `Function` se
muestra como «Función». Se conservan también los tipos reales del índice,
como «Referencia», «Documentación» y «Archivo base».

El extracto reutiliza la selección contextual existente alrededor de la
coincidencia. La interfaz no inventa descripciones ni repite innecesariamente
el título, el tipo y la versión como sustituto de una descripción.

## Iconos

| Uso | Recurso existente |
| --- | --- |
| Búsqueda y acceso a todos los resultados | `docs/assets/img/svg/search.svg` |
| Recursos Sass | `docs/assets/img/svg/sass.svg` |
| Artículos, documentos y recursos sin icono específico | `docs/assets/img/svg/file.svg` |
| Navegación de la fila | `docs/assets/img/svg/arrow.svg` |
| Limpiar búsqueda | `docs/assets/img/svg/close.svg` |

Al redactar esta spec existen `close.svg` y su original en
`docs/assets/img/svg/orig/close.svg`; no queda pendiente el icono de limpieza.
`js.svg` también existe, pero su presencia no autoriza ampliar la búsqueda al
catálogo JavaScript.

Se reutiliza el mecanismo de iconos del proyecto, sin alterar los trazados.
Los atajos continúan representándose como texto de teclado dentro de `kbd`.
Si durante la implementación se identifica otra carencia, debe notificarse al
desarrollador antes de sustituirla por un icono nuevo.

## Interacciones y navegación

| Acción | Resultado |
| --- | --- |
| Escribir una consulta válida | Abre o actualiza la vista inicial. |
| Volver a enfocar el campo con consulta | Reabre sus resultados. |
| Pulsar una fila | Abre la página documental y su sección. |
| `↑` / `↓` | Cambia la selección sin recorrer circularmente los extremos. |
| `Enter` | Abre el resultado seleccionado. |
| `Ctrl/⌘ Enter` | Activa «Ver todos» cuando la acción esté disponible. |
| `/` o `Ctrl/⌘ K` | Enfoca el buscador y selecciona la consulta, conforme al atajo actual. |
| `Escape` | Cierra el desplegable conservando la consulta. |
| Clic fuera del buscador | Cierra el desplegable conservando la consulta. |
| Limpiar búsqueda | Vacía el campo, cierra los resultados y mantiene el foco en el campo. |

El primer resultado queda seleccionado inicialmente. En vista completa, las
flechas recorren toda la lista y desplazan únicamente su región cuando sea
necesario para mantener visible el resultado activo. La selección con ratón y
teclado debe permanecer sincronizada.

`Ctrl/⌘ Enter` se procesa antes de la apertura mediante `Enter`. Los atajos de
navegación solo actúan dentro del buscador; no se interceptan flechas o `Enter`
de otros controles. Se conserva la protección actual para no activar `/` o el
atajo global mientras se escribe en otro campo editable.

`Escape` debe funcionar también desde los controles del panel y devolver el
foco al campo cuando el elemento enfocado vaya a ocultarse. El cierre mediante
clic fuera permite que el destino del clic reciba el foco normalmente.

Toda la fila representa un único destino. El icono, la ruta y la flecha no
introducen acciones independientes. Se conservan los enlaces nativos y sus
acciones modificadas, como abrir en otra pestaña.

Los destinos se construyen con `url` y `anchor`, respetando la raíz documental
y la etiqueta `base`. Para resultados de la página actual se reutilizan las
funciones de `hash_navigation.js`. Para otras páginas se conserva la navegación
y la aplicación del hash después de cargar el contenido asíncrono.

## Estados y accesibilidad

- Sin consulta: desplegable cerrado y sin historial ni sugerencias.
- Cargando: mensaje «Buscando en la documentación...» si existe una consulta
  mientras se obtiene el índice; sin contador ni resultados obsoletos.
- Con resultados: contador, lista y pie correspondiente.
- Sin coincidencias: total cero y mensaje «No se encontraron coincidencias
  en la documentación.»; sin selección ni acción «Ver todos».
- Fallo del índice: no se presenta como una búsqueda global sin coincidencias.
  Si existe un índice local utilizable, se indica «Búsqueda limitada a esta
  página: no se pudo cargar el índice global» y el contador se refiere a ese
  alcance. Si no existe, se muestra «No se pudo cargar la búsqueda.».

El estado de carga o error debe distinguirse de un índice cargado correctamente
sin coincidencias. La resolución asíncrona usa la consulta vigente y no reabre
un panel que el usuario haya cerrado o limpiado mientras esperaba.

El campo expone su relación con la lista y el estado abierto. Debe elegirse una
estructura accesible coherente con la navegación mediante flechas, sin mezclar
roles incompatibles. Si el foco permanece en el campo, la opción activa se
comunica mediante `aria-activedescendant` con identificadores estables.

El total y los mensajes se anuncian mediante una región `aria-live="polite"`
separada de la lista, para no leer todas las filas en cada pulsación. El botón
de limpiar y «Ver todos» son operables con teclado, tienen nombres accesibles
y permanecen en un orden de foco lógico. Los iconos decorativos no duplican
el nombre de cada resultado. No se atrapa el foco en el desplegable.

## Adaptación de la interfaz

- Mantener el flujo desktop-first y las variables de tema existentes.
- Aplicar cada `brp` al selector correspondiente inmediatamente después de
  sus propiedades base, con sus breakpoints consecutivos.
- En móvil, conservar la apertura del buscador desde el encabezado y todas
  las acciones disponibles mediante controles táctiles.
- Reubicar la ruta debajo del texto cuando no quepa a la derecha.
- Limitar la altura al espacio disponible, también con el teclado virtual
  abierto, conservando accesibles campo, lista y controles.
- Evitar desplazamiento horizontal del documento por nombres o rutas largas.
- Ocultar el buscador y su desplegable en impresión, como ocurre actualmente.

## Plan de implementación

1. Ampliar el generador del índice con los metadatos documentales de
   presentación y validar sus orígenes. Mantener su ubicación actual.
2. Separar en `search.js` la obtención y ordenación completa de coincidencias
   del límite de cinco aplicado únicamente a la vista inicial.
3. Mantener estado explícito para consulta, alcance, carga, apertura, resultado
   activo y vista inicial o completa, dentro del módulo existente.
4. Actualizar el encabezado y las plantillas con cabecera, lista y pie
   independientes; añadir el botón de limpiar con el icono existente.
5. Renderizar títulos, metadatos y extractos con nodos de texto y marcas de
   resaltado seguras. Reutilizar la resolución de enlaces y navegación por hash.
6. Incorporar teclado, gestión de foco y anuncios accesibles, evitando
   listeners duplicados tras una nueva inicialización o renderización.
7. Implementar estilos, reserva permanente del canal de scroll y límites del
   panel. Compartir la misma geometría entre la vista inicial y la completa.
8. Regenerar los assets afectados y verificar los criterios de aceptación.

No se necesita una nueva página, librería de búsqueda ni servicio. Los cambios
se mantienen locales a la documentación y siguen sus patrones existentes.

## Archivos previstos para la implementación

| Archivo | Cambio previsto |
| --- | --- |
| `docs/assets/js/core/search.js` | Estado, listado completo, teclado, resaltado y metadatos. |
| `docs/components/global/header.html` | Campo, limpieza y estructura del panel. |
| `docs/templates/templates.html` | Plantillas de filas y estados. |
| `docs/assets/scss/components/_page_search.scss` | Nueva presentación, reserva del scroll y responsive. |
| `docs/assets/css/main.css` | Estilos compilados del buscador. |
| `docs/gulpfile.mjs` | Generación de los metadatos adicionales. |
| `docs/assets/json/components/search_index.json` | Índice regenerado. |
| `docs/assets/json/*.json` | Metadatos documentales explícitos solo cuando sean necesarios. |
| `docs/assets/scss/svg/svg.scss` y su CSS generado | Reutilización de iconos si hacen falta clases compartidas. |

Esta lista identifica los archivos contemplados durante la implementación.

## Verificación y criterios de aceptación

1. Con una consulta que produce más de cinco coincidencias, aparecen cinco
   filas y el contador del total real, incluyendo resultados posteriores al
   límite anterior de doce cuando existan.
2. «Ver todos» muestra la lista completa dentro del mismo panel, sin navegación
   ni modal. Su ancho y altura se conservan para el mismo viewport.
3. El área del scroll está reservada antes de mostrar la lista completa; la
   posición horizontal del texto no cambia al aparecer la barra.
4. La cabecera y el pie no se desplazan al recorrer los resultados. El último
   resultado es alcanzable mediante scroll, teclado y navegación táctil.
5. Cambiar la consulta restablece cinco resultados como máximo, selección
   inicial y scroll al principio; el total y los extractos se actualizan juntos.
6. Con cero, una o cinco coincidencias se muestran estados y cantidades
   correctos, sin ofrecer una acción «Ver todos» innecesaria.
7. Los resultados pertenecen a la documentación. No se agregan utilidades
   JavaScript ni archivos fuente por el solo hecho de existir en el repositorio.
8. Nombre, origen, etiqueta y ruta representan datos documentales reales. Los
   recursos sin origen identificable omiten ese dato y muestran su ruta documental.
9. El resaltado conserva texto y tildes; consultas como `posición`, `posicion`
   y cadenas con caracteres especiales no producen HTML ni cortes incorrectos.
10. Flechas, `Enter`, `Ctrl/⌘ Enter`, `Escape`, limpieza y reapertura cumplen la
    tabla de interacciones. Solo hay un resultado activo y el foco no se pierde.
11. Un resultado de `pages/base.html#position` y uno de una página anidada
    bajo `pages/articles/` abren el documento y el hash correctos, tanto desde
    otra página como desde la propia página de destino.
12. La carga lenta, el fallo del índice y el respaldo local muestran estados
    diferenciados. Una respuesta tardía no restaura una consulta descartada.
13. No hay desbordamiento horizontal en móvil. Una pantalla baja permite
    recorrer las filas iniciales sin revelar automáticamente el resto.
14. En ambos temas se distinguen texto, etiquetas, coincidencias, foco y
    selección. Se verifica con barras de scroll clásicas y superpuestas.
15. El lector de pantalla recibe estado, total y selección sin anunciar toda
    la lista repetidamente. El buscador no aparece en impresión.
16. Todos los iconos provienen de assets existentes y los archivos CSS y JSON
    generados quedan sincronizados con sus fuentes.

Durante la implementación se deben ejecutar desde `docs/`, según los assets
modificados:

```bash
npm exec gulp scss
npm exec gulp process_svg
npm exec gulp search_index
npm exec gulp jsonlint
npm exec gulp lint
```

Si se modifica `assets/scss/svg/svg.scss`, ejecutar además `npm exec gulp css_svg`
antes de `process_svg`. Revisar los cambios generados para preservar los ajustes
previos del desarrollador y evitar incorporar modificaciones ajenas a la tarea.

El lint actual de JavaScript no incluye `assets/js/core/`, y `jsonlint` no
incluye `assets/json/components/search_index.json`. Verificar explícitamente
`search.js`, la sintaxis del generador y el JSON generado además de las tareas
anteriores. Confirmar al menos una consulta representativa y sus enlaces reales.

Al redactar esta spec, ninguno de los dos `package.json` define un script
`test`. Si se incorpora antes de implementar, ejecutar `npm run test` en el
paquete correspondiente. Para esta edición exclusiva de Markdown basta revisar
contenido, enlaces locales y formato del diff; no requiere regenerar el sitio.
