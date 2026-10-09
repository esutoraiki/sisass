# Especificación: constructor interactivo de componentes

## Estado

Implementada.

## Historia de usuario

Como desarrollador que consulta la documentación de SISASS, quiero modificar
los parámetros de `button_simple` desde una interfaz visual, para comprender su
efecto y obtener código reutilizable sin tener que crear manualmente cada
variante.

## Objetivo

Ampliar la documentación de `button_simple` con un constructor interactivo que
permita experimentar con sus parámetros y muestre en tiempo real el resultado
visual, el SCSS y el HTML correspondientes.

La herramienta será una mejora de documentación. No será un editor completo de
componentes para producción.

## Decisiones confirmadas

1. La especificación y la interfaz visible se redactarán en español.
2. La primera versión se limitará a `button_simple`.
3. El ejemplo estático actual se conservará junto al constructor interactivo.
4. Solo se expondrán parámetros públicos y documentados de `button_simple`.
5. La herramienta configurará y mostrará un único botón por vez.
6. El usuario utilizará controles visuales y no tendrá que escribir SCSS para
   configurar el botón.
7. El SCSS generado será la salida principal de código reutilizable.
8. También se mostrará el HTML utilizado para representar el botón.
9. Se podrán previsualizar los estados `active` y `disabled`, además del estado
   normal, cuando el componente los admita.
10. La herramienta ofrecerá presets para casos de uso habituales.
11. La configuración se restablecerá al recargar la página y no se conservará
    entre sesiones.
12. No se generarán enlaces compartibles para configuraciones personalizadas.
13. La herramienta vivirá dentro de la página existente de `button_simple`.
14. La funcionalidad se tratará como documentación interactiva y no como un
    editor de componentes para producción.
15. No habrá exportación de archivos ni descarga de paquetes en la primera
    versión.
16. Sin JavaScript, la página seguirá mostrando el ejemplo estático existente.
17. La incorporación de otros componentes se reservará para una fase posterior.

## Alcance

### Incluido

- Añadir un constructor interactivo a la sección de `button_simple`.
- Exponer todos los parámetros públicos y documentados del mixin.
- Agrupar los controles por propósito: contenido, colores, tipografía,
  espaciado, dimensiones, bordes, transición, cursor y estados.
- Mostrar la vista previa de un único botón.
- Permitir cambiar la vista previa entre los estados soportados.
- Actualizar la vista previa y el código al modificar un control.
- Mostrar SCSS y HTML sincronizados con la configuración actual.
- Permitir copiar el SCSS y el HTML por separado.
- Permitir restaurar los valores por defecto.
- Incluir presets para variantes habituales.
- Mantener la adaptación a pantallas estrechas.
- Conservar el ejemplo estático como alternativa progresiva.

### Excluido

- Modificar la API o el comportamiento de `button_simple`.
- Añadir parámetros, aliases o estados que el mixin no soporte.
- Crear una aplicación independiente de la documentación.
- Guardar configuraciones entre visitas.
- Compartir configuraciones mediante URL.
- Exportar archivos o paquetes.
- Construir una interfaz para otros componentes en esta primera versión.
- Sustituir la referencia API o el ejemplo estático existentes.

## Ubicación dentro de la documentación

El constructor se incorporará a la página existente de botones, dentro de la
sección dedicada a `button_simple`. Debe identificarse claramente como una
herramienta interactiva y estar acompañado por una descripción breve de su
propósito.

La página conservará la documentación de la API, la tabla de parámetros y el
ejemplo estático. El constructor podrá aparecer antes o después del ejemplo,
siempre que la lectura de la referencia no dependa de la interacción.

## Diseño visual

El constructor debe parecer una extensión natural de la documentación existente,
no una aplicación independiente. Se aplican las siguientes decisiones visuales:

- Usar las variables de tema existentes para superficies, texto, bordes,
  acentos y sombras.
- Mantener el contenedor con bordes suaves, sombra ligera y un acento superior
  coherente con los ejemplos de la documentación.
- Mostrar una cabecera con el título `Constructor de button_simple`, una
  etiqueta `Mixin`, una descripción breve, un selector de presets y la acción
  `Restablecer`; el selector y la acción se agrupan en una superficie propia.
- Organizar los controles en tarjetas plegables: contenido, dimensiones,
  colores, bordes, tipografía y comportamiento. La tarjeta abierta debe
  distinguirse mediante borde y sombra sin introducir ruido visual.
- Separar cada borde en controles independientes de ancho, estilo y color,
  integrándolos de nuevo como una única cadena para la API de `button_simple`.
- Mostrar las cuatro familias tipográficas usadas por la documentación:
  `Nunito Sans`, `Fira Sans`, `Montserrat` y `Roboto`, junto con la opción
  predeterminada `sans-serif`.
- Incluir un aviso que explique que las fuentes del campo `Family` son las
  tipografías usadas por la documentación, que se cargan aquí solo para la
  vista previa, que el usuario debe incorporarlas en su proyecto para
  reproducir el resultado y que, si no lo hace, el navegador usará otra fuente
  disponible.
- Ofrecer una lista amplia de valores CSS para `cursor` y `cursor_disabled`,
  incluyendo estados de interacción, selección, movimiento, redimensionado,
  desplazamiento y zoom.
- Identificar el control `reset` como `Aplicar reset inicial (all: initial;)`.
- Mostrar cada control de color con su selector visual y su valor hexadecimal
  visible.
- Presentar la vista previa en una superficie diferenciada, junto a un
  selector de estado para `Normal`, `Active` y `Disabled`, y un selector de
  fondo con las opciones `Claro` y `Oscuro` independiente del tema global de
  la documentación.
- Agrupar la cabecera y la superficie de la vista previa en una tarjeta propia,
  con la indicación `Resultado en tiempo real`. En escritorio, el panel de
  vista previa y código permanece visible mientras se recorren los controles.
- Permitir ampliar la tarjeta de vista previa mediante la API Fullscreen. La
  acción utiliza `fullmax.svg` para entrar, `fullmin.svg` para salir y mantiene
  accesibles los controles de fondo y estado; también puede cerrarse con `Esc`.
  Al salir, debe conservar la posición del constructor y devolver el foco al
  control de pantalla completa sin desplazar la página.
- Mostrar en el submenú de la página los mixins documentados en lugar de sus
  categorías. `button_simple` debe incluir `Constructor interactivo` como una
  entrada secundaria que navegue directamente a la herramienta.
- Mostrar las salidas SCSS y HTML en pestañas de código independientes, cada una
  con su acción `Copiar`.
- Envolver las líneas largas de código para evitar que el layout dependa de un
  scroll horizontal constante.
- Organizar los grupos de controles como secciones plegables para evitar que la
  herramienta presente todos los parámetros como un formulario continuo.
- En escritorio, distribuir los controles y la vista previa en dos columnas.
- En pantallas estrechas, apilar controles, vista previa y salidas
  verticalmente.
- Mantener el desplazamiento horizontal de los bloques de código solo cuando
  sea necesario, sin introducir una scrollbar vertical interna en los
  controles.
- Ocultar la herramienta durante la impresión; la referencia documental y el
  ejemplo estático siguen formando parte de la página imprimible.

Los estilos exclusivos de esta interfaz deben vivir en
`docs/assets/scss/components/_interactive_builder.scss`, que se cargará desde
`docs/assets/scss/main.scss`. No deben incorporarse al parcial de botones ni a
un parcial de tema no relacionado.

## Parámetros configurables

La herramienta debe exponer los parámetros públicos documentados de
`button_simple`, incluidos los valores predeterminados vigentes. Como mínimo,
la configuración debe cubrir:

- Dimensiones: `width`, `height` y `aspect_ratio`.
- Fondo: `bg`, `bg_hover`, `bg_active` y `bg_disabled`.
- Texto: `color`, `color_hover`, `color_active` y `color_disabled`.
- Borde: `border-radius`, `border`, `border_hover`, `border_active` y
  `border_disabled`.
- Transición: `time`.
- Tipografía: las opciones admitidas por `tf`.
- Cursor: `cursor` y `cursor_disabled`.
- Restablecimiento: `reset`.

Si la API documentada cambia antes de implementar la herramienta, los controles
deben mantenerse alineados con la API vigente y no con una lista duplicada que
pueda quedar obsoleta.

## Comportamiento funcional

### Estado inicial

- El constructor inicia con los valores predeterminados documentados de
  `button_simple`.
- La vista previa representa un botón válido desde el primer momento.
- El código inicial coincide con la vista previa y con los valores mostrados en
  los controles.

### Edición

- Cada cambio de control actualiza la vista previa.
- Cada cambio actualiza el SCSS y el HTML mostrados.
- Los controles deben indicar claramente la unidad o el tipo de valor cuando
  sea necesario.
- Los valores inválidos deben identificarse y no deben generar una vista
  previa incoherente.
- La herramienta no debe modificar archivos del proyecto.

### Estados visuales

El usuario podrá seleccionar los estados admitidos por el componente para
comprobar sus diferencias visuales:

- Estado normal.
- `active`.
- `disabled`.

La interfaz no debe mostrar como disponibles estados que no estén respaldados
por la implementación real de `button_simple`.

### Presets

Los presets deben cargar configuraciones completas y reconocibles, sin imponer
la paleta de colores de la documentación. La primera versión incluirá:

- Botón claro.
- Botón oscuro.
- Botón con contorno.
- Botón deshabilitado.

Al seleccionar un preset, todos los controles, la vista previa y los bloques de
código deben actualizarse. El usuario podrá modificar el preset después de
cargarlo.

### Restauración

El usuario debe poder restablecer todos los controles a los valores
predeterminados documentados. La restauración también debe actualizar la vista
previa y las salidas de código.

## Salidas de código

El constructor debe mostrar dos bloques reutilizables:

1. **SCSS**: configuración equivalente a los valores seleccionados para
   `button_simple`, incluyendo `@use "sisass_components/buttons" as *;`.
   Solo incluye las claves cuyo valor difiere del default documentado; si no
   hay cambios, genera `@include button_simple;`.
2. **HTML**: marcado utilizado por la vista previa.

Cada bloque tendrá su propia acción de copiar. La copia debe informar
visualmente si se realizó correctamente, sin cambiar la configuración actual.

La salida SCSS debe ofrecer junto a la acción de copiar un control `Alias`. Al
activarlo, las claves con aliases públicos deben regenerarse usando
su variante corta; las claves sin alias conservan su nombre completo. El
control no modifica los valores, la vista previa ni el HTML generado.

El contenido mostrado debe corresponder exactamente a la configuración activa.
No se mostrarán fragmentos que no participen en la vista previa.

## Requisitos de experiencia

- La interfaz debe separar visualmente los controles, la vista previa y el
  código generado.
- Las etiquetas deben ser comprensibles para usuarios que conocen CSS o SCSS,
  pero no necesariamente la implementación interna del mixin.
- Los nombres técnicos como `bg_hover` o `border_disabled` se conservarán
  cuando sean necesarios para relacionar el control con la API documentada.
- En escritorio, los controles y la vista previa deben poder consultarse sin
  navegación confusa.
- En pantallas estrechas, las áreas deben reorganizarse verticalmente y los
  bloques de código deben conservar desplazamiento horizontal.
- La herramienta no debe ocultar la referencia estática ni impedir la lectura
  de la página cuando no se interactúe con ella.

## Mejora progresiva

El ejemplo estático debe existir en el HTML inicial o continuar disponible
como contenido alternativo. Cuando JavaScript no esté disponible, el visitante
debe poder consultar al menos el ejemplo y la referencia de `button_simple`.

La ausencia de JavaScript no debe producir un área vacía ni dejar controles
inoperables como única representación del componente.

## Integración con los recursos existentes

La implementación debe reutilizar la página y los recursos existentes de
botones, manteniendo sincronizados los recursos fuente y generados cuando se
modifiquen estilos o ejemplos.

| Recurso | Responsabilidad esperada |
| --- | --- |
| `docs/pages/buttons.html` | Alojar la página que contiene la referencia de botones. |
| `docs/components/buttons/button_simple.html` | Mantener la documentación y el ejemplo de `button_simple`. |
| `docs/assets/js/pages/buttons.js` | Inicializar el comportamiento interactivo de la página. |
| `docs/assets/js/components/button_builder.js` | Gestionar controles, presets, vista previa, estados y salidas de código. |
| `docs/assets/json/buttons.json` | Mantener el registro y la navegación de la página. |
| `docs/assets/scss/components/_interactive_builder.scss` | Definir la apariencia responsive del constructor interactivo. |
| `docs/assets/scss/main.scss` | Cargar los estilos del constructor en los recursos generales de documentación. |
| `docs/assets/scss/buttons/` | Contener los estilos fuente de los ejemplos estáticos de botones. |
| `docs/assets/css/buttons/` | Contener los estilos generados que se muestran o utilizan en la documentación. |

No se deben editar manualmente los recursos generados cuando exista una tarea
del proyecto para reconstruirlos.

## Criterios de aceptación

1. El visitante puede abrir la documentación de `button_simple` y configurar
   el botón sin editar código.
2. La herramienta inicia con los valores predeterminados documentados.
3. Cada cambio válido se refleja en la vista previa.
4. El SCSS y el HTML mostrados corresponden a la configuración activa.
5. El SCSS no repite parámetros que mantienen su valor predeterminado.
6. El visitante puede consultar los estados `normal`, `active` y `disabled`
   que soporte el componente.
7. El visitante puede cargar un preset y modificarlo posteriormente.
8. El visitante puede restaurar todos los valores predeterminados.
9. El SCSS y el HTML se pueden copiar de forma independiente.
10. La interfaz funciona en escritorio y en pantallas estrechas.
11. La página sigue siendo útil y muestra el ejemplo estático sin JavaScript.
12. La herramienta no cambia la API, los valores predeterminados ni el
    comportamiento de `button_simple`.
13. La configuración no se conserva al recargar la página.
14. No se generan enlaces compartibles, archivos descargables ni paquetes.

## Evolución posterior

Después de validar el constructor de `button_simple`, se podrá evaluar su
extensión a otros componentes documentados. Esa fase deberá definir de forma
independiente los parámetros, presets, estados y salidas de cada componente.

La primera implementación no debe imponer una interfaz de usuario distinta
para cada componente futuro ni incluir controles que no sean necesarios para
`button_simple`.
