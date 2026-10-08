# Especificación: constructores interactivos de mixins basados en esquemas

## Estado

Implementada.

## Historia de usuario

Como desarrollador que consulta la documentación de SISASS, quiero que los
constructores interactivos se generen a partir de la API documentada de cada
mixin, para explorar componentes, layouts, tipografía, helpers u otras
capacidades sin que la herramienta presuponga que todos se comportan como un
botón.

Como responsable de la documentación, quiero definir los parámetros y controles
de cada constructor mediante un esquema JSON, para conservar una experiencia
homogénea y evitar repetir la lógica general de formularios, estado, generación
de código y accesibilidad.

## Objetivo

Reemplazar la implementación específica y monolítica del constructor de
`button_simple` por una arquitectura reutilizable dirigida por esquemas JSON.
Cada esquema describirá la API pública, los controles y las capacidades de un
mixin, mientras que un núcleo JavaScript común administrará la experiencia del
constructor.

La arquitectura debe ser aplicable a cualquier clase de mixin y no debe asumir
que existen botones, colores, estados interactivos o una estructura HTML común.

## Relación con la especificación existente

La especificación
[`interactive_component_builder.md`](./interactive_component_builder.md)
continúa siendo la fuente de verdad para la experiencia visible y el
comportamiento de `button_simple`.

Esta especificación sustituye únicamente la arquitectura interna con la que se
declaran y construyen las herramientas. La migración no debe eliminar ni
degradar ninguna capacidad ya aprobada para `button_simple`.

## Decisiones confirmadas

1. La configuración funcional de cada constructor vivirá en un archivo JSON
   independiente.
2. El núcleo será agnóstico al tipo de mixin y construirá los formularios desde
   el esquema.
3. `button_simple` será el primer y único constructor migrado dentro de este
   alcance.
4. La apariencia y las funciones actuales de `button_simple` se conservarán,
   salvo correcciones necesarias para cumplir esta especificación.
5. Cada constructor utilizará un adapter JavaScript registrado para crear y
   actualizar su vista previa y generar el HTML. El adapter se limitará a esas
   responsabilidades y a adaptar, cuando corresponda, valores aplicados a las
   variables CSS de la vista previa.
6. La generación del mapa SCSS será responsabilidad del núcleo común.
7. La solución no utilizará frameworks externos.
8. No se extraerán automáticamente parámetros desde los archivos SCSS.
9. No se incluirá un editor visual de esquemas.
10. `AGENTS.md` deberá documentar y exigir esta arquitectura para todos los
    constructores futuros.

## Alcance

### Incluido

- Definir el formato de los esquemas JSON de constructores.
- Crear un núcleo genérico que interprete los esquemas.
- Generar grupos y controles desde la configuración declarativa.
- Mantener un estado canónico independiente de las limitaciones del DOM.
- Generar SCSS con nombres completos o aliases.
- Permitir mapas anidados y campos compuestos.
- Sincronizar controles, presets, vista previa, SCSS y HTML.
- Conservar las funciones compartidas de accesibilidad, copiado, pestañas,
  fullscreen, responsive, impresión y fallback progresivo.
- Usar adapters registrados para la vista previa, el HTML y la adaptación de
  valores aplicados a sus variables CSS.
- Migrar `button_simple` al nuevo sistema.
- Retirar del módulo actual la configuración que pase a ser responsabilidad del
  esquema o del núcleo.
- Actualizar `AGENTS.md` con las reglas de creación y validación.
- Actualizar la documentación técnica afectada y sus recursos generados.

### Excluido

- Crear constructores para otros mixins durante esta primera migración.
- Modificar la API SCSS de `button_simple` o de cualquier otro mixin.
- Crear un lenguaje de expresiones dentro de JSON.
- Ejecutar código arbitrario declarado en los esquemas.
- Generar automáticamente esquemas desde SCSS.
- Crear una interfaz para editar o exportar esquemas.
- Interpretar dependencias declarativas, obligatoriedad condicional o
  expresiones entre campos.
- Ejecutar constructores sin un adapter registrado.
- Incorporar dependencias o frameworks para formularios o administración de
  estado.
- Persistir configuraciones entre sesiones o compartirlas mediante URL.

## Principios de arquitectura

### Núcleo dirigido por esquemas

El núcleo común debe recibir una raíz de interfaz y un esquema validado. Sus
responsabilidades serán:

- cargar e interpretar el esquema;
- construir grupos y controles;
- inicializar y conservar el estado canónico;
- aplicar presets y restaurar defaults;
- leer cambios del usuario sin perder valores no representables por un control;
- identificar parámetros modificados;
- generar el `@use`, el `@include` y el mapa SCSS;
- alternar nombres completos y aliases;
- coordinar vista previa, HTML, pestañas y acciones de copia;
- administrar fullscreen y retorno de foco;
- exponer errores de inicialización mediante el fallback de la herramienta.

El núcleo no debe contener nombres de parámetros ni decisiones de interfaz
exclusivas de `button_simple`.

### Esquema por mixin

Cada constructor tendrá un archivo en una ubicación común bajo
`docs/assets/json/`. El nombre del archivo debe permitir identificar el mixin
sin depender de la página en la que se renderiza.

El esquema será la fuente de verdad del constructor para:

- módulo SCSS;
- nombre del mixin;
- selector de ejemplo;
- grupos de controles;
- parámetros públicos;
- aliases y alias preferido;
- defaults;
- tipo de control;
- orden de presentación y serialización;
- mapas anidados;
- campos compuestos;
- estados de vista previa;
- presets.

Los valores del esquema deben verificarse contra la implementación SCSS y la
tabla de parámetros documentada. El esquema no autoriza APIs que el mixin no
soporte.

### Adapters requeridos

La implementación vigente requiere que cada esquema declare un adapter
registrado. El núcleo común administra el formulario y la experiencia general,
pero no presupone una estructura HTML válida para todos los mixins. Las
responsabilidades permitidas del adapter son:

- crear o actualizar una vista previa particular;
- generar una estructura HTML específica;
- adaptar un valor antes de aplicarlo a una variable CSS de la vista previa.

Los adapters no deben volver a implementar presets, aliases, generación del
mapa SCSS, copiado, pestañas, fullscreen ni administración general del estado.

La posibilidad de ejecutar un constructor sin adapter queda como una evolución
diferida. Solo debe implementarse cuando exista un constructor real cuya vista
previa y cuyo HTML puedan describirse mediante un contrato genérico compartido.
Esa causalidad debe documentarse y acompañarse de la validación y las pruebas
del nuevo contrato; no debe añadirse como abstracción preventiva.

## Formato funcional del esquema

### Identidad

Cada esquema debe declarar como mínimo:

- `id`: identificador estable del constructor;
- `mixin`: nombre literal usado por `@include`;
- `module`: ruta literal usada por `@use`;
- `selector`: selector utilizado en el fragmento SCSS generado.

### Grupos

El array `groups` define únicamente los grupos que el mixin necesita. Cada
entrada debe incluir un `id` estable y una etiqueta visible en español.

No se deben crear grupos vacíos ni imponer categorías como colores, bordes o
tipografía a mixins que no las utilicen.

### Campos

Cada entrada de `fields` debe poder declarar:

- clave pública completa;
- lista ordenada de aliases públicos;
- alias preferido opcional;
- etiqueta visible;
- grupo;
- tipo de control;
- valor predeterminado;
- aceptación de un valor nulo opcional mediante `optional`;
- ruta de un mapa padre, cuando corresponda;
- opciones para controles cerrados;
- aceptación de valores CSS o SCSS que no pueda representar el control visual;
- metadatos necesarios para un campo compuesto.

El núcleo admite controles de texto, selección, booleano, color y borde
compuesto. Se añadirán tipos adicionales solamente cuando un mixin real los
requiera.

El esquema vigente no admite dependencias declarativas, obligatoriedad
condicional ni expresiones entre campos. Estas capacidades quedan diferidas y
solo deben incorporarse cuando una relación real entre parámetros no pueda
resolverse con el contrato actual. La ampliación debe partir de ese caso de uso,
definir una semántica acotada y actualizar conjuntamente el núcleo, el
validador, las pruebas y esta especificación.

### Aliases

Cada campo puede declarar cero o más aliases. El toggle visible se llamará
`Alias` y estará desactivado inicialmente.

Cuando se active:

1. se usará `preferred_alias` cuando esté definido y sea válido;
2. de lo contrario, se elegirá el alias público más corto;
3. si no existen aliases, se conservará la clave completa.

El cambio debe regenerar únicamente la salida SCSS. No debe modificar el estado,
el preset, la vista previa ni el HTML.

La misma regla se aplica a claves dentro de mapas anidados.

### Defaults y presets

Los defaults declarados deben coincidir con la API pública vigente. El núcleo
omitirá de la salida SCSS toda clave cuyo valor normalizado coincida con su
default.

Cada esquema debe incluir el estado `Por defecto`; `Personalizado` se utilizará
cuando el usuario modifique un valor. Los demás presets serán opcionales y
deberán representar capacidades reales del mixin sin adoptar la paleta de la
documentación como identidad del componente generado.

### Estados de vista previa

El esquema declarará únicamente los estados que el mixin pueda representar. Un
mixin sin estados interactivos no mostrará un selector vacío ni opciones
heredadas de otros constructores.

Las etiquetas visibles se redactarán en español, excepto identificadores
técnicos como `active` o `disabled` cuando sea necesario relacionarlos con la
API.

## Estado canónico y controles visuales

El estado del constructor será la fuente de verdad. Los valores del DOM no
deben sustituirlo cuando un control no pueda representar el valor completo.

En particular:

- un selector de color no debe convertir `transparent`, `currentColor`, una
  variable o una función en `#000000`;
- los valores SCSS válidos deben conservarse durante cambios de aliases,
  pestañas, fondo, estado o fullscreen;
- una edición manual del control debe reemplazar explícitamente el valor
  canónico correspondiente;
- los campos compuestos deben descomponerse para edición y recomponerse sin
  perder información;
- la restauración y los presets deben actualizar tanto el estado como los
  controles representables.

## Generación de código

### SCSS

La salida debe contener:

1. el `@use` indicado por el esquema;
2. el selector configurado;
3. el `@include` del mixin;
4. únicamente las claves modificadas respecto a sus defaults.

Si no existen parámetros modificados, se generará el include sin mapa. Los
mapas anidados deben conservar su estructura y omitir también las claves que
mantengan su default.

El orden de las claves seguirá el orden definido en el esquema para producir
resultados estables y legibles.

### HTML

El HTML generado debe coincidir exactamente con el marcado utilizado por la
vista previa y proviene del adapter registrado por el constructor.

No se mostrarán nodos, clases ni atributos que no participen en el resultado.

## Experiencia común

Todos los constructores deben conservar, cuando sean aplicables:

- cabecera con nombre del mixin, descripción, preset y restauración;
- grupos plegables;
- vista previa en tiempo real;
- fondo claro y oscuro independiente del tema global;
- estados declarados por el esquema;
- salidas SCSS y HTML;
- toggle `Alias` junto a `Copiar` en la salida SCSS;
- feedback accesible de copia;
- fullscreen con `fullmax.svg` y `fullmin.svg`;
- salida con `Esc`, restauración del scroll y retorno de foco;
- diseño en dos columnas para escritorio y apilado adaptable;
- ausencia de doble scroll;
- ocultamiento durante impresión;
- ejemplo estático disponible sin JavaScript.

Una capacidad no aplicable no debe mostrarse como control vacío o deshabilitado
solo para conservar simetría visual.

## Carga, validación y errores

El esquema debe validarse antes de construir la interfaz. Como mínimo se debe
detectar:

- identidad incompleta;
- ids duplicados;
- grupos inexistentes;
- claves duplicadas dentro de la misma ruta;
- aliases duplicados o incompatibles;
- tipo de control desconocido;
- preset que referencia un campo inexistente;
- mapa padre inválido;
- adapter ausente o no registrado.

Cuando el esquema sea inválido o no pueda cargarse:

- no se debe presentar un constructor parcialmente funcional;
- la página documental debe continuar disponible;
- el ejemplo estático debe permanecer visible;
- el fallback debe explicar que el constructor no pudo iniciarse;
- el detalle técnico debe registrarse en consola para diagnóstico.

## Migración de `button_simple`

La migración debe conservar:

- todos los parámetros y aliases públicos vigentes;
- mapas anidados de `tf`;
- presets existentes;
- campos de borde separados visualmente y serializados como una sola clave;
- valores especiales como `transparent`;
- estados `Normal`, `Active` y `Disabled`;
- fondos `Claro` y `Oscuro`;
- generación mínima de SCSS;
- toggle `Alias`;
- HTML sincronizado;
- copiado;
- fullscreen;
- accesibilidad y comportamiento responsive;
- entrada secundaria del constructor en el menú de página.

La migración se considerará incorrecta si modifica silenciosamente un valor,
añade claves default al SCSS o produce un resultado visual diferente con la
misma configuración.

## Alineación obligatoria de `AGENTS.md`

La implementación no estará completa hasta actualizar la sección de
constructores interactivos de `AGENTS.md`. Esa guía deberá establecer:

- que los constructores se definen primero mediante un esquema JSON;
- la ubicación y responsabilidad de los esquemas;
- las claves mínimas y los tipos de controles admitidos;
- el estado canónico como fuente de verdad;
- la selección de aliases y el toggle `Alias`;
- la obligación actual de declarar un adapter registrado;
- qué responsabilidades nunca deben duplicarse en un adapter;
- que los adapters opcionales y las dependencias declarativas son capacidades
  diferidas, condicionadas a una necesidad real y verificable;
- la conservación del ejemplo estático y del fallback;
- la integración con `contentLoad`, el menú de página y el buscador;
- los comandos y pruebas obligatorios.

Las instrucciones anteriores que indiquen crear un módulo JavaScript completo
por mixin deberán corregirse para evitar contradicciones con esta arquitectura.

## Archivos previstos

La implementación deberá resolver, como mínimo, estas responsabilidades en las
áreas indicadas:

| Área | Responsabilidad |
| --- | --- |
| `docs/assets/json/` | Esquemas de constructores por mixin. |
| `docs/assets/js/components/` | Núcleo común y registro de adapters requeridos. |
| `docs/components/` | Contenedor documental, ejemplo estático y fallback. |
| `docs/assets/scss/components/_interactive_builder.scss` | Presentación compartida de los constructores. |
| `AGENTS.md` | Convenciones obligatorias para constructores futuros. |

La implementación puede elegir nombres concretos dentro de estas áreas, pero no
debe fragmentar el núcleo en archivos atómicos sin una responsabilidad
suficiente ni crear carpetas profundas innecesarias.

## Criterios de aceptación

1. `button_simple` se inicializa a partir de un esquema JSON independiente.
2. El núcleo no contiene claves, presets ni defaults exclusivos de
   `button_simple`.
3. Los grupos y controles visibles de `button_simple` se construyen desde el
   esquema.
4. La configuración por defecto genera un include sin mapa de parámetros.
5. Los parámetros modificados se generan en el orden del esquema.
6. El toggle `Alias` alterna correctamente claves principales y anidadas sin
   cambiar otros resultados.
7. Las claves sin alias conservan su nombre completo.
8. `transparent` permanece intacto al alternar aliases, estados, fondos y
   pestañas.
9. Los presets, la restauración y la edición manual mantienen sincronizados el
   estado, los controles, la vista previa, el SCSS y el HTML.
10. Los campos de borde se editan por partes y se generan como una sola cadena.
11. La vista previa y el HTML conservan el comportamiento previo de
    `button_simple`.
12. Fullscreen conserva sus iconos, controles, salida con `Esc`, scroll y foco.
13. Un esquema inválido activa el fallback sin impedir la lectura de la página.
14. El ejemplo estático funciona sin JavaScript.
15. No se incorpora ningún framework ni editor de esquemas.
16. `AGENTS.md` describe la arquitectura basada en esquemas y no conserva
    instrucciones contradictorias.
17. La composición se verifica en escritorio y pantallas estrechas sin doble
    scroll.
18. El buscador y el menú de página continúan navegando a los destinos correctos.

## Validación requerida

- Validar el esquema correcto y casos representativos de esquema inválido.
- Comparar defaults y aliases contra la implementación SCSS de `button_simple`
  y el mapa anidado de `tf`.
- Verificar presets, restauración y edición de cada tipo de campo.
- Comprobar nombres completos y aliases en parámetros principales y anidados.
- Probar valores no representables por controles visuales, especialmente
  `transparent`.
- Verificar SCSS y HTML mediante copia y comparación con la vista previa.
- Probar fullscreen por botón y `Esc`, incluido el retorno al constructor.
- Validar escritorio, breakpoints estrechos, impresión y funcionamiento sin
  JavaScript.
- Ejecutar las tareas de SCSS, lint, buscador y JSON lint indicadas por el
  repositorio.
- Ejecutar `node --check` sobre los módulos JavaScript modificados.
- Ejecutar cualquier script `test` disponible en el paquete afectado.

## Asunciones aprobadas

1. `button_simple` será el único constructor migrado inicialmente.
2. La migración conservará sus funciones y apariencia actuales.
3. Cada mixin tendrá su propio esquema JSON.
4. Los formularios se generarán desde los esquemas.
5. Se admitirán campos simples, compuestos y mapas anidados.
6. Se conservarán valores CSS y SCSS que un control visual no represente.
7. Cada constructor declarará un adapter registrado y limitado a la vista
   previa, el HTML y excepciones propias del mixin.
8. El núcleo será responsable de la generación del mapa SCSS.
9. El alias preferido tendrá prioridad y, en su ausencia, se usará el más corto.
10. Un esquema inválido mostrará el fallback sin romper la página.
11. No se incluirá un editor visual de esquemas.
12. Los esquemas se mantendrán manualmente.
13. No se utilizarán frameworks externos.
14. Se conservarán la estética y las convenciones de accesibilidad actuales.
15. `AGENTS.md` documentará el flujo completo y su validación.
16. La especificación se redactará en español y se registrará en `spec/`.

## Capacidades diferidas

Las siguientes ideas se conservan como posibles evoluciones, pero no forman
parte del contrato implementado y no deben condicionar constructores nuevos:

- adapters opcionales mediante una representación genérica de vista previa y
  HTML;
- dependencias declarativas entre campos;
- obligatoriedad condicional;
- expresiones o reglas ejecutables desde el esquema;
- normalizaciones de estado o validaciones particulares ejecutadas por un
  adapter;
- nuevos tipos de control sin un mixin consumidor.

Una capacidad diferida solo debe implementarse cuando exista una necesidad
actual demostrable o una causalidad técnica adecuada: un mixin real que no
pueda representarse correctamente con las capacidades vigentes. Antes de
ampliar el núcleo se debe documentar el caso, limitar el alcance al problema
observado y definir su validación. La ampliación debe incluir pruebas del caso
válido y de esquemas inválidos, además de actualizar `AGENTS.md` y esta
especificación. No se implementarán estas capacidades para anticipar requisitos
hipotéticos.
