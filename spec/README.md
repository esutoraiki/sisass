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

## Convenciones

- Escribe las specs en español, salvo que se requiera explícitamente otro idioma.
- Usa enunciados funcionales claros, no notas de implementación, salvo que la implementación afecte el comportamiento del usuario.
- Mantén separadas las asunciones de los requisitos confirmados.
- Referencia archivos existentes solo cuando sean relevantes para la funcionalidad que se está especificando.

## Mantenimiento

- Actualiza la spec correspondiente antes de cambiar el comportamiento de la funcionalidad.
- Si una funcionalidad crece más allá de una sola spec, sepárala en archivos más pequeños y actualiza este índice.
