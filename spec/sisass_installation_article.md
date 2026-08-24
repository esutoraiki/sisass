# Especificación: artículo de instalación de SISASS

## Estado

Definida para implementación.

## Historia de usuario

Como desarrollador que desea adoptar SISASS, quiero disponer de un artículo que explique cómo instalar el paquete y conectar sus archivos SCSS con el proceso de compilación de mi proyecto, para completar una instalación funcional sin tener que deducir comandos, rutas o dependencias a partir del código fuente.

## Objetivo

Crear un único artículo de documentación que explique la instalación de SISASS en los siguientes entornos:

- Un proyecto tradicional con HTML, CSS y JavaScript.
- SQHTML.
- SQHTML2.
- Un proyecto React existente sin Vite.
- Un proyecto React con Vite.

El artículo debe diferenciar claramente tres responsabilidades:

1. Instalar el paquete `sisass`.
2. Ejecutar el instalador de SISASS para copiar la carga `core` correspondiente.
3. Instalar y configurar el preprocesador que convierte SCSS en CSS.

## Clasificación documental

- Tipo: página autónoma de artículo.
- Categoría de navegación: `Comienza rápido`.
- Idioma: español.
- Título visible: `Instalación de SISASS`.
- Slug y nombre base de archivos: `installation`.
- Versión visible: `2.x.x`.

El artículo debe seguir la estructura general de la página existente `project_structure`, pero no debe incorporar el árbol visual ni sus estilos específicos.

## Público objetivo

El artículo está dirigido a desarrolladores que conocen los fundamentos de HTML, JavaScript y npm, pero que no necesariamente han configurado Sass previamente.

No se debe asumir que el lector conoce:

- La diferencia entre SISASS y el compilador Sass.
- La forma en que `npm explore` cambia el directorio de ejecución.
- El significado de las rutas relativas aceptadas por `--path`.
- La configuración de Sass dentro de Webpack o Vite.

## Alcance funcional

### 1. Introducción y selector de entorno

El artículo debe comenzar con una explicación breve de qué se instalará y una tabla que permita elegir el procedimiento adecuado.

La tabla debe contener, como mínimo:

| Entorno | Compilador recomendado | Modo del instalador | Destino esperado |
| --- | --- | --- | --- |
| HTML, CSS y JavaScript | `sass` | Normal | `assets/scss/core/` |
| SQHTML | `sass` | `--dep sqhtml` | `assets/scss/core/` dentro de la raíz elegida |
| SQHTML2 | `sass` | `--dep sqhtml2` | `src/core/` |
| React sin Vite | `sass` | Normal con `--path` | `src/assets/scss/core/` |
| React con Vite | `sass-embedded` o `sass` | Normal con `--path` | `src/assets/scss/core/` |

`sass-embedded` debe presentarse como la opción preferente para Vite y `sass` como alternativa compatible.

### 2. Requisitos comunes

El artículo debe indicar:

- La versión mínima de Node.js admitida por SISASS en el momento de publicar.
- Que los comandos deben ejecutarse desde la raíz del proyecto consumidor.
- Que `sisass` se instala como dependencia del proyecto.
- Que el compilador se instala localmente como dependencia de desarrollo.
- Que SISASS 2.x.x utiliza el sistema de módulos de Sass con `@use` y `@forward`.
- Que no se debe usar `node-sass` ni construir ejemplos nuevos con `@import`.

Los comandos deben usar npm. No se deben duplicar procedimientos para Yarn, pnpm o Bun.

Los comandos no deben fijar automáticamente la última versión publicada de Sass. El artículo puede mostrar en una nota la versión de Sass probada por SISASS en el momento de su publicación.

### 3. Instalación en HTML, CSS y JavaScript

El procedimiento debe incluir:

1. Inicializar `package.json` con `npm init -y` cuando el proyecto todavía no lo tenga.
2. Instalar SISASS.
3. Instalar `sass` como dependencia de desarrollo.
4. Ejecutar el instalador normal:

   ```bash
   npm explore sisass -- npm run init
   ```

5. Confirmar que se creó `assets/scss/core/`.
6. Crear un punto de entrada SCSS.
7. Añadir scripts de npm para una compilación puntual y para observación de cambios.
8. Compilar el SCSS a un archivo CSS.
9. Enlazar el CSS generado desde el documento HTML.
10. Comprobar un estilo visible generado con una utilidad de SISASS.

La compilación debe usar rutas de carga explícitas cuando sean necesarias para resolver el paquete o la carga `core`.

### 4. Instalación en SQHTML

El procedimiento debe usar:

```bash
npm explore sisass -- npm run init -- --dep sqhtml
```

También debe documentar la combinación de `--dep sqhtml` con `--path` para cambiar la raíz del destino.

El artículo debe explicar que este modo:

- Copia los archivos distribuidos en `assets/scss/core/` dentro de la raíz elegida.
- Añade `$c3: #1F567B;` cuando el bloque de ejemplo de SQHTML todavía no existe.
- Configura `$f1` con Roboto.
- Configura `$i1` como `../../img/svg/`.
- Sustituye el ejemplo de `_fonts.scss` por las declaraciones de Roboto o las añade si todavía no existen.

La explicación debe identificar los archivos modificados y el resultado esperado, sin presentar estas personalizaciones como parte de la instalación normal.

### 5. Instalación en SQHTML2

El procedimiento debe usar:

```bash
npm explore sisass -- npm run init -- --dep sqhtml2
```

El artículo debe explicar que este modo:

- Ignora cualquier valor recibido mediante `--path`.
- Fuerza el destino `src/core/` dentro del proyecto consumidor.
- Aplica los mismos ajustes de variables y fuentes que el modo SQHTML.
- Regenera `_index.scss` con los módulos definidos en `instances.config.js`.

El artículo debe mostrar el resultado esperado de `_index.scss` según la configuración vigente, pero debe señalar que SQHTML2 continúa en desarrollo.

Antes de publicar, se debe volver a comparar esta sección con `install.js` e `instances.config.js`. No se debe afirmar que SQHTML2 produce una compilación independiente si todavía depende de módulos aportados por el proyecto consumidor.

### 6. Instalación en React sin Vite

Esta sección debe partir de un proyecto React existente y aclarar que React no define por sí mismo el procesamiento de SCSS.

Webpack será el caso concreto de integración. El procedimiento debe:

1. Confirmar que el proyecto utiliza Webpack.
2. Instalar SISASS y `sass`.
3. Instalar `sass-loader` y reutilizar `css-loader` y `style-loader` cuando ya formen parte de la configuración.
4. Ejecutar el instalador con una ruta que produzca `src/assets/scss/core/`:

   ```bash
   npm explore sisass -- npm run init -- --path ../../src/
   ```

5. Configurar la regla para archivos `.scss` o verificar la regla existente.
6. Crear un punto de entrada SCSS global dentro de `src/`.
7. Importar el punto de entrada desde el archivo JavaScript o JSX principal.
8. Mostrar, de forma opcional, la convención `.module.scss` cuando el proyecto ya tenga habilitados CSS Modules.
9. Verificar la compilación de desarrollo y la construcción de producción.

El artículo no debe mencionar Create React App.

### 7. Instalación en React con Vite

El procedimiento debe:

1. Partir de un proyecto React con Vite ya creado.
2. Instalar SISASS.
3. Instalar `sass-embedded` como dependencia de desarrollo:

   ```bash
   npm install --save-dev sass-embedded
   ```

4. Presentar `sass` como alternativa cuando `sass-embedded` no sea adecuado para la plataforma o el proyecto.
5. Aclarar que Vite no necesita un plugin específico para procesar `.scss` o `.sass`.
6. Ejecutar el instalador con `--path ../../src/` para crear `src/assets/scss/core/`.
7. Crear un punto de entrada SCSS e importarlo desde `main.jsx` o desde el componente correspondiente.
8. Incluir una variante breve con `.module.scss`.
9. Verificar el servidor de desarrollo.
10. Ejecutar y verificar la construcción de producción.

### 8. Uso de SISASS después de instalar

Todos los procedimientos deben terminar con un ejemplo mínimo que compruebe dos aspectos:

- Que la carga `core` se encuentra en la ruta documentada.
- Que un módulo público de SISASS puede resolverse y compilarse.

Durante la implementación del artículo se debe probar la ruta pública real del paquete. Se aplicarán estas reglas:

1. Usar `@use "sisass" as s;` únicamente si el paquete publicado lo resuelve correctamente.
2. Si el paquete todavía no expone ese punto de entrada, documentar temporalmente la ruta que funcione y señalarla como compatibilidad transitoria.
3. No copiar una instrucción del README sin comprobarla mediante una compilación real.
4. El ejemplo debe producir una regla CSS observable, no limitarse a cargar archivos sin salida.

### 9. Rutas del instalador

El artículo debe explicar que `npm explore sisass` ejecuta el comando desde el directorio del paquete instalado. Por esta razón, valores como `../../src/` se interpretan desde `node_modules/sisass` en una instalación npm convencional.

Debe incluir una tabla con estos comportamientos:

| Modo | Respeta `--path` | Destino | Transformaciones adicionales |
| --- | --- | --- | --- |
| Normal | Sí | `<raíz>/assets/scss/core/` | Ninguna |
| `sqhtml` | Sí | `<raíz>/assets/scss/core/` | Variables y fuentes de SQHTML |
| `sqhtml2` | No | `src/core/` | Variables, fuentes y generación de instancias |

### 10. Advertencia de sobrescritura

Antes de los comandos que ejecutan el instalador debe aparecer una advertencia visible:

- El instalador copia nuevamente los seis archivos de `files/`.
- Una ejecución posterior puede sobrescribir personalizaciones locales realizadas en los archivos de destino.
- El usuario debe conservar sus cambios o revisar la diferencia antes de reinstalar.

### 11. Solución de problemas

El artículo debe cubrir, como mínimo:

- El comando `sass` no está disponible.
- Vite o Webpack no puede resolver un archivo SCSS.
- SISASS no puede resolverse mediante `@use`.
- `--path` genera los archivos en un destino inesperado.
- Se esperaba que `sqhtml2` respetara `--path`.
- Faltan módulos de SQHTML2 que deben existir en el proyecto consumidor.
- Se intentó usar `node-sass` o `@import`.

Cada problema debe incluir causa probable, comprobación y solución breve.

## Estructura y archivos requeridos

La implementación debe crear o actualizar:

| Archivo | Responsabilidad |
| --- | --- |
| `docs/pages/articles/installation.html` | Contenedor HTML, metadatos, estructura principal y carga del script de página. |
| `docs/components/articles/installation.html` | Contenido completo del artículo. |
| `docs/assets/js/pages/installation.js` | Carga asíncrona del contenido, breadcrumb, navegación por hash, buscador y loader. |
| `docs/assets/json/installation.json` | Breadcrumb manual y registro del componente indexable. |
| `docs/components/global/menu.html` | Enlace del artículo dentro de `Comienza rápido`. |
| `docs/assets/json/search_index.json` | Índice regenerado mediante Gulp. |

No se debe crear un archivo SCSS específico para la página salvo que exista una necesidad visual que no pueda resolverse con los estilos compartidos.

## Requisitos de marcado

### Página

- El documento debe declarar `lang="es"`.
- El título y la descripción deben identificar la instalación de SISASS.
- El `body` debe usar el enlace activo `installation`.
- El contenido principal debe incluir un nodo con `id="installation"`.

### Componente

La raíz debe ser:

```html
<article id="installation" class="installation">
```

`group_title` debe contener exactamente la información conceptual siguiente:

- `Instalación de SISASS`.
- `Tipo: Artículo`.
- `Versión: 2.x.x`.

Cada entorno debe disponer de un `id` estable para navegación y búsqueda. Como mínimo:

- `installation_requirements`
- `installation_html`
- `installation_sqhtml`
- `installation_sqhtml2`
- `installation_react`
- `installation_react_vite`
- `installation_paths`
- `installation_troubleshooting`

Todas las tablas deben tener la clase `full` y estar envueltas en `div.container_table`.

Los ejemplos se presentarán como secciones consecutivas. No se debe utilizar `TabPanel` en esta página.

### JSON y breadcrumb

`docs/assets/json/installation.json` debe:

- Definir el breadcrumb manual `articles / installation.html`.
- Incluir un elemento en `components` que apunte a `../components/articles/installation.html`.
- Usar `installation` como `id` y `node` principal.

### Script de página

`docs/assets/js/pages/installation.js` debe seguir el flujo de las páginas de documentación actuales:

1. Registrar los estados necesarios en el loader.
2. Esperar `contentLoad`.
3. Inicializar el breadcrumb con el JSON de la página.
4. Inicializar la navegación por hash.
5. Inicializar el buscador global.
6. Marcar cada estado como completado en el orden correspondiente.

No debe importar ni inicializar `TabPanel`.

## Estilo editorial

- Todo el contenido visible debe redactarse en español natural.
- Los nombres de paquetes, comandos, rutas, API e identificadores deben conservarse en inglés.
- Los pasos deben usar verbos imperativos y resultados comprobables.
- La primera aparición de un término técnico debe explicarse brevemente.
- Debe mantenerse la terminología `Sass` para la tecnología y `SCSS` para la sintaxis y extensión utilizada en los ejemplos.
- No se debe usar `SASS` como nombre genérico cuando el texto se refiera al producto Sass.
- La prosa debe revisarse en gramática, ortografía, tildes, puntuación y consistencia antes de finalizar.

## Referencias normativas

La implementación debe contrastar los comandos y recomendaciones con estas fuentes oficiales:

- Instalación de Sass: <https://sass-lang.com/install/>
- Sistema de módulos `@use`: <https://sass-lang.com/documentation/at-rules/use/>
- Instalación y uso de dependencias de desarrollo en npm: <https://docs.npmjs.com/cli/install/>
- Estilos en React: <https://react.dev/learn>
- Instalación de React: <https://react.dev/learn/installation>
- Características CSS y preprocesadores de Vite: <https://vite.dev/guide/features>
- Opciones de preprocesadores de Vite: <https://vite.dev/config/shared-options>
- Integración de Sass con Webpack: <https://webpack.js.org/loaders/sass-loader/>

Las fuentes externas determinan la recomendación del preprocesador. El comportamiento de SISASS, SQHTML y SQHTML2 debe obtenerse del `install.js` y `instances.config.js` vigentes en este repositorio.

## Criterios de aceptación

### Contenido

- Existe un solo artículo con los cinco escenarios solicitados.
- Cada escenario incluye requisitos, instalación, destino, integración, compilación y verificación.
- No existe ninguna mención a Create React App.
- Vite recomienda `sass-embedded` y admite `sass` como alternativa.
- Los demás escenarios usan `sass` como dependencia local de desarrollo.
- Los ejemplos usan npm y no duplican comandos para otros gestores.
- SQHTML2 está identificado como una integración provisional.
- Existe una advertencia sobre la sobrescritura de archivos.
- La versión más reciente de Sass no está fijada en los comandos.

### Exactitud técnica

- Cada comando documentado se ejecuta satisfactoriamente en un proyecto de prueba adecuado.
- La instalación normal crea `assets/scss/core/`.
- `--path ../../src/` crea `src/assets/scss/core/` en la estructura npm prevista.
- `--dep sqhtml` aplica las transformaciones descritas.
- `--dep sqhtml2` crea `src/core/`, ignora `--path` y genera `_index.scss`.
- Los ejemplos HTML y React producen CSS observable.
- La integración Webpack funciona en desarrollo y producción.
- La integración Vite funciona con el servidor de desarrollo y con la construcción de producción.
- La ruta pública de SISASS usada por `@use` ha sido validada y coincide con el paquete publicado.

### Integración documental

- El enlace aparece en `Comienza rápido` y activa el estado correcto del menú.
- El breadcrumb muestra `articles / installation.html`.
- Todos los encabezados con `id` se pueden abrir mediante su hash.
- El artículo aparece en el buscador global.
- Una consulta representativa abre `pages/articles/installation.html` con el hash correcto.
- No se editó manualmente `docs/assets/json/search_index.json`.

### Verificación obligatoria

Desde `docs/` se debe ejecutar:

```bash
npm exec gulp search_index
npm exec gulp jsonlint
npm exec gulp lint
```

Si la implementación requiere cambios SCSS, también se debe ejecutar:

```bash
npm exec gulp scss
```

Si la compilación deja SVG pendiente de procesar, se debe ejecutar además:

```bash
npm exec gulp process_svg
```

Si `docs/package.json` incorpora un script `test`, también debe ejecutarse `npm run test`.

## Fuera de alcance

- Explicar toda la API de mixins, funciones, componentes, efectos o formas de SISASS.
- Crear desde cero una aplicación completa de React, Vite, SQHTML o SQHTML2.
- Documentar gestores de paquetes diferentes de npm.
- Corregir el instalador, el manifiesto del paquete o sus puntos de entrada como parte del artículo.
- Crear una migración de instalaciones anteriores.
- Presentar SQHTML2 como estable antes de finalizar su implementación.

## Dependencias y riesgos

- `install.js` tiene cambios en curso; las rutas y transformaciones deben revisarse nuevamente antes de publicar.
- SQHTML2 puede depender de módulos que no forman parte de los seis archivos copiados por el instalador.
- El punto de entrada público indicado actualmente en el README debe probarse contra el paquete realmente publicado.
- Las recomendaciones de Sass, React, Vite y Webpack pueden cambiar; deben validarse de nuevo al implementar el artículo.
- Ejecutar nuevamente el instalador puede sobrescribir personalizaciones del proyecto consumidor.

## Resultado esperado

Un desarrollador debe poder elegir su entorno, ejecutar únicamente los pasos correspondientes, identificar dónde quedaron los archivos de SISASS, compilar una regla SCSS real y confirmar el resultado en el navegador o en la construcción de su aplicación.
