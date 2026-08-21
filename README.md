# SISASS

Simple Interface for SASS.

SISASS es un framework de utilidades Sass para proyectos HTML, CSS y JavaScript, así como para integraciones con React, Vite, SQHTML y SQHTML2.

## Requisitos

- Node.js y npm.
- Un proyecto con `package.json`.
- `sass` como compilador Sass. React con Vite también puede usar `sass-embedded`.

## Instalación rápida

Desde la raíz del proyecto consumidor, instala SISASS y el compilador Sass:

```bash
npm init -y
npm install sisass
npm install --save-dev sass
```

Después, ejecuta el instalador:

```bash
npm explore sisass -- npm run init
```

La instalación normal crea la carga distribuida en `assets/scss/core/`. Para cambiar la raíz de recursos, puedes usar `--path`:

```bash
npm explore sisass -- npm run init -- --path ../../resources/
```

## Compilar los estilos

Crea `assets/main.scss` e importa SISASS y sus variables:

```scss
@use "sisass/src/sisass" as s;
@use "core/variables" as variables;

.installation_check {
    @include s.text((align: center));
    color: variables.$c2;
}
```

Compila el archivo indicando `assets` y `node_modules` como rutas de carga:

```bash
npx sass assets/main.scss assets/css/main.css \
    --load-path assets \
    --load-path node_modules
```

Después, enlaza `assets/css/main.css` desde tu HTML.

SISASS utiliza el sistema de módulos de Sass: emplea `@use` y `@forward`; no uses `node-sass` ni construyas integraciones nuevas con `@import`.

## Variantes de instalación

El instalador también dispone de modos específicos para SQHTML y SQHTML2. React sin Vite utiliza Webpack como ejemplo, mientras que React con Vite requiere configurar la ruta de carga de Sass para resolver `node_modules/sisass/src/_sisass.scss`.

Consulta el artículo completo para revisar los comandos, la configuración de cada entorno, los ejemplos de CSS Modules y la solución de problemas:

[Guía de instalación de SISASS](https://esutoraiki.github.io/sisass/pages/articles/installation.html)

## Documentación

[Visitar la documentación de SISASS](https://esutoraiki.github.io/sisass/)
