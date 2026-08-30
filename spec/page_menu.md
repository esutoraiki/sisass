# Especificación: menú de navegación de la página actual

## Estado

Definida para implementación.

## Historia de usuario

Como lector de la documentación de SISASS, quiero disponer de un menú de la
página actual construido a partir de sus secciones, para recorrer artículos
extensos rápidamente y conservar enlaces directos estables.

Como mantenedor de la documentación, quiero que el menú se derive de los
encabezados existentes, para evitar duplicar títulos y enlaces en HTML,
JavaScript o JSON.

## Objetivo

Crear un menú lateral reutilizable que:

- Use encabezados `h2` y `h3` seleccionados explícitamente.
- Se construya después de cargar asincrónicamente el contenido de la página.
- Respete la jerarquía y el orden del artículo.
- Navegue mediante hashes estables.
- Indique la sección visible sin modificar el hash durante el scroll manual.
- Sea accesible, responsive y reutilizable en otras páginas.
- No incorpore al menú los encabezados que pertenezcan a un `TabPanel`.

## Decisiones confirmadas

1. Los encabezados del artículo son la única fuente de verdad del menú.
2. Solo participan encabezados marcados con `data-page-menu-item`.
3. Los `h2` representan secciones principales.
4. Los `h3` representan subsecciones del último `h2` válido.
5. Cada encabezado navegable declara manualmente un `id` único y estable.
6. El sistema no genera identificadores a partir del texto visible.
7. `data-page-menu-label` permite definir una etiqueta abreviada opcional.
8. El título visible y accesible del menú es `En esta página`.
9. La sección activa usa `is_active` y `aria-current="location"`.
10. El scroll manual actualiza el estado activo, pero no reemplaza el hash.
11. En escritorio, el menú es sticky y admite scroll interno.
12. En móvil, el menú aparece antes del artículo como una región desplegable
    cerrada inicialmente.
13. El menú no se muestra durante la impresión.
14. Si no existen encabezados válidos, la región del menú permanece oculta.
15. Los errores de marcado no bloquean el contenido de la página.
16. La primera integración se realiza en la página de instalación.
17. El JSON de la página no almacena títulos ni entradas del menú.
18. `TabPanel` se conserva en la página de instalación.
19. Todo encabezado ubicado dentro de un nodo `data-tab-panel-panel` queda
    excluido del menú, incluso si declara `data-page-menu-item`.

## Relación con la especificación de instalación

Esta especificación reemplaza únicamente las decisiones de
`spec/sisass_installation_article.md` que prohíben el uso de `TabPanel` en la
página de instalación. Los entornos pueden continuar agrupados en pestañas.

El menú de la página no debe enlazar encabezados de los paneles, porque sus
destinos pueden permanecer ocultos. El resto de los requisitos del artículo de
instalación continúa vigente.

## Alcance

### Incluido

- Componente JavaScript compartido para construir y mantener el menú.
- Estilos compartidos para escritorio, móvil e impresión.
- Contrato de marcado para seleccionar encabezados navegables.
- Navegación mediante hashes existentes.
- Estado activo según la sección visible.
- Integración inicial en `docs/pages/articles/installation.html`.
- Normalización de los identificadores navegables del artículo de instalación.
- Validación tolerante de identificadores faltantes o duplicados.
- Actualización de los assets compilados y del buscador cuando corresponda.

### Excluido

- Guardar manualmente las entradas del menú en archivos JSON.
- Generar identificadores automáticamente desde el texto de un encabezado.
- Incluir todos los `h2` y `h3` sin una marca explícita.
- Incluir encabezados internos de tarjetas, avisos, referencias o ejemplos si
  no declaran `data-page-menu-item`.
- Incluir encabezados que pertenezcan a un panel de `TabPanel`.
- Modificar el hash mientras el usuario se desplaza manualmente.
- Incorporar el menú a todas las páginas en la primera implementación.
- Reemplazar el menú global de la documentación.

## Contrato de marcado

### Región del menú

Una página que use esta funcionalidad debe declarar una única región:

```html
<aside
    id="sidebar_menu"
    class="sidebar_menu a4"
></aside>
```

La región debe estar disponible antes de inicializar el componente. Una página
sin `#sidebar_menu` continúa funcionando sin errores.

### Encabezado navegable

Cada encabezado que deba aparecer en el menú debe declarar un `id` y
`data-page-menu-item`:

```html
<h2
    id="installation_requirements"
    data-page-menu-item
>
    Requisitos comunes
</h2>
```

El texto visible del encabezado se usa como etiqueta predeterminada.

### Etiqueta abreviada

Cuando el texto completo no sea adecuado para el menú, se puede declarar una
etiqueta alternativa:

```html
<h3
    id="installation_vite_namespace"
    data-page-menu-item
    data-page-menu-label="Con namespace"
>
    Forma 1: con namespace (recomendada)
</h3>
```

Un valor vacío o compuesto solo por espacios en `data-page-menu-label` se
ignora y usa el texto visible del encabezado.

### Encabezados dentro de `TabPanel`

Un encabezado queda fuera del menú cuando su ancestro más cercano contiene
`data-tab-panel-panel`:

```html
<div data-tab-panel-panel="react">
    <h2
        id="installation_react"
        data-page-menu-item
    >
        React sin Vite
    </h2>
</div>
```

En este caso, `installation_react` no se representa en el menú lateral. No es
necesario retirar el atributo del encabezado para aplicar la exclusión.

## Construcción del menú

El inicializador debe:

1. Resolver `#main_content` como raíz predeterminada del contenido.
2. Resolver `#sidebar_menu` como región predeterminada del menú.
3. Buscar `h2[data-page-menu-item]` y `h3[data-page-menu-item]` en el orden del
   documento.
4. Excluir los encabezados ubicados dentro de `data-tab-panel-panel`.
5. Validar identificadores y jerarquía.
6. Crear un `nav` con el nombre accesible `En esta página`.
7. Generar una lista ordenada de secciones y subsecciones.
8. Insertar un enlace `href="#<id>"` para cada encabezado válido.
9. Preparar la detección de la sección visible.
10. Mostrar la región solo cuando exista al menos un encabezado válido.

El orden del menú debe coincidir con el orden de los encabezados en el DOM.

## Jerarquía

- Un `h2` crea un elemento principal.
- Los `h3` siguientes pertenecen al último `h2` válido.
- Un nuevo `h2` inicia otro grupo principal.
- Un `h3` que aparece antes de cualquier `h2` válido se omite y produce una
  advertencia en consola.
- No se representan niveles distintos de `h2` y `h3` en esta versión.

## Validaciones y recuperación

### Identificador faltante

Un encabezado marcado sin `id`:

- No se incorpora al menú.
- Produce una advertencia identificable en consola.
- No impide construir las demás entradas.

### Identificador duplicado

Si dos o más encabezados marcados comparten un `id`:

- Todas las entradas que usan ese identificador se omiten.
- Se produce una advertencia identificable en consola.
- Los demás encabezados válidos continúan disponibles.

### Región ausente

Si no existe `#sidebar_menu`, el inicializador devuelve un resultado vacío y no
modifica la página.

### Sin elementos válidos

Si no existen encabezados válidos, la región permanece oculta y no se genera un
`nav` vacío.

## Estructura generada

El resultado debe usar elementos semánticos equivalentes a:

```html
<nav class="page_menu" aria-label="En esta página">
    <p class="page_menu_title">En esta página</p>
    <ol class="page_menu_list">
        <li class="page_menu_item page_menu_item_level_2">
            <a class="page_menu_link" href="#installation_requirements">
                Requisitos comunes
            </a>
            <ol class="page_menu_sublist">
                <li class="page_menu_item page_menu_item_level_3">
                    <a class="page_menu_link" href="#installation_example">
                        Ejemplo
                    </a>
                </li>
            </ol>
        </li>
    </ol>
</nav>
```

No se deben crear manejadores que sustituyan innecesariamente el comportamiento
nativo de los enlaces.

## Navegación y hash

- Cada enlace usa el `id` del encabezado como hash.
- La navegación debe ser compatible con `init_hash_navigation`.
- Una URL abierta directamente con un hash válido enfoca el encabezado después
  de cargar el contenido.
- Seleccionar una entrada actualiza el hash mediante el comportamiento nativo
  del enlace.
- El scroll manual no añade entradas al historial ni reemplaza la URL.
- El menú no intenta activar pestañas ni revelar encabezados excluidos de
  `TabPanel`.

## Estado activo

- El encabezado que representa la sección visible determina la entrada activa.
- Solo un enlace puede tener `aria-current="location"` al mismo tiempo.
- El enlace activo y su elemento reciben `is_active`.
- Cuando una subsección `h3` está activa, su grupo `h2` puede conservar una
  clase visual de contexto, pero no debe recibir un segundo
  `aria-current="location"`.
- Al llegar al final del artículo, permanece activa la última sección válida.

## Comportamiento responsive

### Escritorio

- El menú usa la columna derecha reservada por `.a4`.
- Permanece visible mediante posicionamiento sticky.
- Su altura máxima respeta el viewport.
- Cuando el contenido excede la altura disponible, el menú usa scroll interno.

### Móvil y tablet

- La región aparece antes del contenido principal en el orden de lectura.
- El menú se presenta como una región desplegable.
- Su estado inicial es cerrado.
- El control informa su estado mediante `aria-expanded`.
- Seleccionar un enlace cierra el menú y conserva la navegación al hash.

### Impresión

`#sidebar_menu` y su contenido no deben aparecer en la salida impresa.

## Accesibilidad

La implementación debe:

- Usar un `nav` con `aria-label="En esta página"`.
- Conservar enlaces nativos navegables mediante teclado.
- Usar `aria-current="location"` solo en el enlace activo.
- Proporcionar un control móvil operable con teclado.
- Mantener sincronizados `aria-expanded` y el estado visual del desplegable.
- No depender únicamente del color para identificar el estado activo.
- Respetar el orden semántico de los encabezados.

## Ciclo de inicialización

Cada página que incorpore el menú debe seguir este orden:

1. Registrar los estados requeridos por el loader.
2. Esperar `contentLoad`.
3. Inicializar los comportamientos propios del contenido, incluido `TabPanel`
   cuando corresponda.
4. Inicializar el menú de la página.
5. Inicializar el breadcrumb.
6. Marcar el contenido como listo.
7. Inicializar la navegación por hash.
8. Marcar la navegación como lista.
9. Inicializar el buscador global.
10. Marcar el buscador como listo.

El menú debe existir antes de restaurar el hash inicial.

## Integración en la página de instalación

La implementación inicial debe:

1. Conservar `#sidebar_menu` en
   `docs/pages/articles/installation.html`.
2. Ubicar la región antes de `main` en el orden del DOM o proporcionar un orden
   responsive equivalente que la muestre antes del artículo.
3. Corregir el identificador duplicado `installation_requirements` y conservar
   el hash en el encabezado navegable.
4. Añadir identificadores estables a los encabezados externos a `TabPanel` que
   deban formar parte del menú.
5. Añadir `data-page-menu-item` únicamente a esos encabezados.
6. Excluir títulos de tarjetas, avisos y enlaces de referencias.
7. Conservar el `TabPanel` de entornos y su inicialización actual.
8. Excluir del menú `installation_html`, `installation_react`,
   `installation_react_vite`, `installation_sqhtml`, `installation_sqhtml2` y
   cualquier subsección ubicada dentro de sus paneles.
9. Inicializar el menú después de `TabPanel` y antes de la navegación por hash.

## Archivos previstos

La implementación debe revisar o crear, como mínimo:

- `docs/assets/js/core/page_menu.js`.
- `docs/assets/scss/components/_page_menu.scss`.
- `docs/assets/scss/main.scss`.
- `docs/assets/css/main.css`.
- `docs/pages/articles/installation.html`.
- `docs/components/articles/installation.html`.
- `docs/assets/js/pages/installation.js`.
- `docs/assets/json/components/search_index.json` cuando cambien textos o
  hashes indexables.

No se debe añadir una lista duplicada de entradas a
`docs/assets/json/installation.json`.

## Verificación

### Estructura

- Confirmar que cada encabezado marcado tenga un `id` único.
- Confirmar que el orden del menú coincida con el DOM.
- Confirmar que los `h3` queden bajo el `h2` correcto.
- Confirmar que ningún encabezado interno de `TabPanel` aparezca en el menú.
- Confirmar que cada enlace resuelva un encabezado real y visible.

### Navegación

- Abrir la página sin hash.
- Abrirla con el hash de un encabezado incluido.
- Seleccionar entradas principales y secundarias.
- Desplazarse manualmente y comprobar el estado activo.
- Confirmar que el scroll manual no modifique el hash.
- Confirmar que las pestañas continúen funcionando independientemente.

### Responsive y accesibilidad

- Verificar el menú sticky en escritorio.
- Verificar scroll interno con una lista extensa.
- Verificar el desplegable cerrado inicialmente en móvil.
- Verificar apertura, cierre y selección mediante teclado.
- Confirmar `aria-expanded` y `aria-current`.
- Confirmar que el menú no aparezca al imprimir.

### Tareas del proyecto

Después de modificar los assets correspondientes, ejecutar desde `docs/`:

```bash
npm exec gulp scss
npm exec gulp process_svg
npm exec gulp search_index
npm exec gulp jsonlint
npm exec gulp lint
```

Si `package.json` incorpora un script `test`, ejecutar también:

```bash
npm run test
```

## Criterios de aceptación

1. La página de instalación muestra un menú construido desde sus encabezados
   marcados.
2. No existe una lista manual equivalente en el JSON de la página.
3. Cada entrada navega a un hash explícito y estable.
4. Los `h2` y `h3` conservan una jerarquía visual y semántica correcta.
5. Los títulos de tarjetas, avisos y referencias no aparecen accidentalmente.
6. Ningún encabezado ubicado dentro de `data-tab-panel-panel` aparece en el
   menú.
7. `TabPanel` continúa funcionando en el artículo de instalación.
8. El scroll manual actualiza una única entrada activa sin modificar la URL.
9. La navegación directa mediante un hash válido funciona después de
   `contentLoad`.
10. En escritorio, el menú permanece visible y controla su propio overflow.
11. En móvil, el menú aparece antes del artículo y comienza cerrado.
12. El control móvil es operable con teclado y mantiene `aria-expanded`.
13. El enlace activo usa `aria-current="location"`.
14. El menú queda oculto cuando no existen encabezados válidos.
15. Los errores de identificadores producen advertencias y no bloquean la
    página.
16. El menú no aparece durante la impresión.
17. Las páginas que no incorporan `#sidebar_menu` continúan funcionando sin
    cambios.
18. Los assets compilados y el buscador quedan sincronizados.
19. Las tareas de validación terminan correctamente.
