# Historia de Usuario: Estructura lógica de instalación de SISASS

## Objetivo

Como mantenedor de SISASS, quiero que los archivos distribuidos vivan en una estructura lógica y plana dentro de `files/`, para que el instalador sea quien construya la jerarquía final en el proyecto consumidor, tanto en la instalación por defecto como en una instalación personalizada con `--path`.

## Alcance

- Reorganizar la distribución interna de los archivos que hoy viven dentro de `files/`.
- Mantener el comportamiento de instalación para proyectos consumidores.
- Hacer que el instalador cree la estructura final de carpetas al copiar los archivos.
- Conservar la compatibilidad con la ruta por defecto y con `--path`.
- Mantener el soporte de los modos especiales de instalación existentes, salvo que su comportamiento dependa directamente de la nueva estructura de origen.

## Requisitos funcionales

1. Los archivos distribuidos de SISASS deben poder almacenarse de forma lógica y plana dentro de `files/`.
2. El instalador debe crear la estructura final de carpetas en el proyecto destino durante la copia.
3. La instalación por defecto debe seguir terminando en la ubicación esperada por el consumidor del paquete.
4. Si el proyecto destino no existe, el instalador debe crear la ruta necesaria antes de copiar.
5. La instalación con `--path` debe seguir funcionando como una instalación personalizada.
6. La estructura final generada por el instalador debe ser equivalente en la instalación por defecto y en la instalación personalizada, cambiando solo la raíz de destino.
7. Los modos especiales de instalación existentes no deben perder compatibilidad funcional por este cambio.

## Requisitos de comportamiento

- La reorganización interna de `files/` no debe cambiar el resultado funcional de la instalación.
- El usuario final no debe tener que aprender una sintaxis nueva para instalar SISASS.
- El instalador debe seguir resolviendo automáticamente la ruta destino cuando no se proporciona `--path`.
- La creación de carpetas debe formar parte del proceso de instalación y no depender de que el consumidor las cree manualmente.

## Criterios de aceptación

- Los archivos fuente distribuidos ya no dependen de una jerarquía física rígida dentro de `files/`.
- La instalación por defecto continúa creando la estructura esperada en el proyecto consumidor.
- Una instalación con `--path` también recibe la estructura correcta sin intervención manual adicional.
- El contenido copiado mantiene su propósito y funcionamiento tras la reorganización.
- Los modos especiales de instalación siguen produciendo su salida esperada.

## Exclusiones

- No se redefine la API pública del instalador.
- No se introducen nuevas banderas de línea de comandos.
- No se cambia el contenido funcional de los archivos instalados.
- No se detalla aquí una migración automática de proyectos ya instalados.

## Notas

- Esta especificación describe un cambio de organización interna y de responsabilidad en la creación de carpetas.
- La implementación puede ajustar la estructura exacta de `files/` y la lógica de copia siempre que cumpla los criterios de aceptación.
