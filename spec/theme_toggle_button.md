# Historia de Usuario: Botón para cambio de tema

## Objetivo

Como usuario de la documentación de SISASS, quiero alternar entre tema claro y tema oscuro mediante un botón en la cabecera, para adaptar la lectura a mi preferencia visual.

## Alcance

- El botón de tema vive en la cabecera de la documentación.
- El cambio aplica a toda la interfaz visual de la documentación.
- El documento inicia con tema claro por defecto si no existe una elección previa.
- La preferencia del sistema no se usa como criterio de selección automática.
- La preferencia elegida por el usuario se conserva entre visitas.
- El HTML inicial ya existe en `docs/components/global/header.html` y no debe reestructurarse para esta especificación.

## Requisitos funcionales

1. El usuario puede alternar entre dos estados: `light` y `dark`.
2. El botón debe mostrar de forma clara el estado visual del tema activo.
3. El cambio de tema debe afectar al fondo, texto, superficies y controles de la documentación.
4. El estado del tema debe mantenerse al navegar entre páginas del sitio.
5. Si el usuario no ha elegido manualmente un tema, el sitio debe cargar en modo claro.
6. El botón no debe ser accesible por teclado.

## Requisitos de experiencia

- La interfaz debe comunicar de forma visible que existe un control de tema.
- El cambio de tema debe ser inmediato y sin recarga de página.
- El usuario debe percibir una transición coherente entre ambos modos.

## Criterios de aceptación

- Al pulsar el botón, la documentación cambia entre tema claro y oscuro.
- El tema activo se conserva mientras el usuario navega por la documentación.
- Si no hay preferencia previa guardada, la documentación abre en tema claro.
- La documentación no aplica automáticamente la preferencia del sistema.
- El HTML base del header se mantiene sin cambios estructurales innecesarios.

## Exclusiones

- No se definen aquí estilos concretos, valores de color o reglas tipográficas.
- No se incluyen requisitos de navegación por teclado para este botón, y su uso por teclado queda descartado por alcance.
- No se incorpora lógica de detección automática del sistema operativo.

## Notas

- Esta especificación solo define el comportamiento funcional del botón y su efecto sobre el tema.
- La implementación puede usar la estrategia técnica que mejor encaje con el proyecto, siempre que respete estos criterios.
