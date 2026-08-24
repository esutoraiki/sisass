# Documentación de SISASS

Este directorio contiene el sitio de documentación de SISASS, con sus páginas, componentes reutilizables, ejemplos SCSS y recursos estáticos.

## Requisitos

- Node.js y npm.
- Un navegador web moderno.

## Instalación

Instala las dependencias desde este directorio:

```bash
cd docs
npm install
```

## Desarrollo local

El sitio debe servirse mediante un servidor HTTP para que funcionen correctamente los módulos JavaScript y las rutas de los recursos. Desde `docs/`, inicia el servidor incluido:

```bash
node config/serve.js
```

Después, abre <http://localhost:8125/> en el navegador. También puedes elegir otro puerto:

```bash
node config/serve.js --port 8080
```

La página principal usa `<base href="/assets/">`. Por eso, el sitio debe abrirse desde la raíz del servidor y no directamente con `file://`.

## Compilación y validación

Ejecuta estos comandos desde `docs/`:

```bash
# Compilar los archivos SCSS
npm exec gulp scss

# Compilar los estilos SVG
npm exec gulp css_svg

# Procesar los SVG incluidos en el CSS compilado
npm exec gulp process_svg

# Validar los archivos JavaScript
npm exec gulp lint

# Validar los archivos JSON
npm exec gulp jsonlint

# Regenerar el índice de búsqueda
npm exec gulp search_index
```

Para observar los cambios durante el desarrollo, ejecuta:

```bash
npm exec gulp
```

El watcher recompila SCSS, procesa SVG, valida JSON y JavaScript, y actualiza el índice de búsqueda cuando cambian sus archivos de origen.

## Estructura principal

- `index.html`: portada del sitio.
- `pages/`: páginas HTML de la documentación.
- `components/`: fragmentos HTML cargados dinámicamente.
- `templates/`: plantillas compartidas.
- `assets/scss/`: fuentes SCSS de la documentación y ejemplos.
- `assets/css/`: CSS generado.
- `assets/js/`: lógica del sitio, cargadores, navegación, búsqueda y librerías.
- `assets/json/`: configuración de páginas y componentes.
- `config/serve.js`: servidor HTTP local.
- `scripts/implement_tab_panel.mjs`: conversor de ejemplos a paneles de pestañas.

## Documentar ejemplos con `TabPanel`

Para convertir el primer ejemplo de una página a pestañas, ejecuta desde la raíz del repositorio:

```bash
npm run tab_panel -- --file components/base/nombre.html
```

También puedes ejecutarlo desde `docs/`:

```bash
npm run tab_panel -- --file components/base/nombre.html
```

Usa `--index` cuando la página tenga varios ejemplos, `--id` para definir un identificador personalizado y `--dry-run` para revisar los cambios sin escribirlos. Consulta todas las opciones con:

```bash
npm run tab_panel -- --help
```

Los ejemplos con pestañas deben mantener `Resultado` como vista inicial, seguido de `SCSS`, `CSS generado` y `HTML`, salvo que la página requiera otro orden.

## Flujo recomendado

1. Edita la página, el componente o el recurso SCSS correspondiente.
2. Ejecuta las tareas de compilación y validación necesarias.
3. Si cambia contenido indexable, regenera `assets/json/components/search_index.json` con `npm exec gulp search_index`.
4. Inicia el servidor local y comprueba la página en el navegador.

El índice de búsqueda es un archivo generado; no debe editarse manualmente.
