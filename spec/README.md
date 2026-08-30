# Índice de Especificaciones

Esta carpeta contiene especificaciones de producto e interfaz para funcionalidades de la documentación de SISASS.

## Cómo usar esta carpeta

- Lee el archivo de spec que corresponda a la funcionalidad que vas a cambiar.
- Usa la spec como fuente de verdad para alcance, comportamiento y criterios de aceptación.
- Añade un nuevo archivo de spec aquí cuando una funcionalidad necesite su propia definición.
- Mantén cada spec enfocada en una sola funcionalidad o en un conjunto muy relacionado.

## Especificaciones existentes

| Archivo | Propósito |
| --- | --- |
| [theme_toggle_button.md](./theme_toggle_button.md) | Define el botón para cambiar la documentación entre modo claro y modo oscuro. |
| [rgb_alpha.md](./rgb_alpha.md) | Define la documentación de la función `rgb-alpha` en la sección base. |
| [pb.md](./pb.md) | Define la función `pb`, su cálculo inverso respecto a `bp` y su documentación en la sección base. |
| [installer_structure.md](./installer_structure.md) | Define la reorganización lógica de `files/` y la creación de la estructura de instalación por parte de `install.js`. |
| [sisass_installation_article.md](./sisass_installation_article.md) | Define el artículo para instalar SISASS en proyectos HTML, SQHTML, SQHTML2, React y React con Vite. |
| [mediaqueries_modernization.md](./mediaqueries_modernization.md) | Define la modernización de los mixins de media queries, sus APIs secuenciales y map, las nuevas condiciones y su documentación. |
| [container_query.md](./container_query.md) | Define el mixin `container-query`, sus interfaces posicional y map, las consultas admitidas y su documentación. |
| [page_menu.md](./page_menu.md) | Define el menú de navegación de la página actual generado desde encabezados seleccionados explícitamente. |

## Convenciones

- Escribe las specs en español, salvo que se requiera explícitamente otro idioma.
- Usa enunciados funcionales claros, no notas de implementación, salvo que la implementación afecte el comportamiento del usuario.
- Mantén separadas las asunciones de los requisitos confirmados.
- Referencia archivos existentes solo cuando sean relevantes para la funcionalidad que se está especificando.

## Mantenimiento

- Actualiza la spec correspondiente antes de cambiar el comportamiento de la funcionalidad.
- Si una funcionalidad crece más allá de una sola spec, sepárala en archivos más pequeños y actualiza este índice.
