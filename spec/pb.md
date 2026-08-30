# Especificación: función `pb`

## Estado

Definida para implementación.

## Historia de usuario

Como desarrollador que usa SISASS, quiero convertir un porcentaje en una medida
calculada a partir de una base de referencia, para recuperar de forma directa el
valor proporcional que representa ese porcentaje.

## Objetivo

Crear la función Sass `pb` como operación inversa conceptual de `bp`. Mientras
`bp` convierte una medida de referencia en un porcentaje, `pb` debe convertir un
porcentaje en una medida relativa a una base y devolver el resultado con la
unidad solicitada.

## Decisiones confirmadas

1. `pb` será una función Sass, no un mixin, porque su resultado se utilizará
   como valor de propiedades CSS.
2. La operación será `(value * base) / 100`.
3. `value` representará un porcentaje expresado como número; por ejemplo, `20`
   representará el 20 %.
4. La función admitirá valores negativos y superiores a `100`.
5. La unidad predeterminada será `"px"`.
6. La API usará un mapa y conservará las claves y los alias de `bp`:
   `base | b`, `unit | u` y `value | v`.
7. Una base igual a `0` será válida y producirá un valor numérico igual a `0`
   con la unidad solicitada.
8. La funcionalidad incluirá una sección completa en la documentación de base.
9. El ejemplo principal mostrará la relación inversa conceptual entre `bp` y
   `pb` mediante una base de `1920`, un valor inicial de `384` y un porcentaje
   de `20`.

## Alcance

### Incluido

- Incorporar `pb` en `src/_base.scss` junto a `bp`.
- Aceptar una configuración mediante mapa.
- Resolver las claves largas y sus alias mediante el comportamiento compartido
  que emplea `bp`.
- Concatenar al resultado la unidad indicada.
- Crear la documentación de `pb` en la página de referencia de base.
- Añadir un ejemplo real con resultado, SCSS, CSS generado y HTML.
- Mantener sincronizados los assets fuente y compilados del ejemplo.
- Incorporar la nueva sección al JSON, la página base y el buscador global.

### Excluido

- Modificar el comportamiento o la interfaz de `bp`.
- Restringir `value` al intervalo entre `0` y `100`.
- Añadir una API de parámetros posicionales.
- Introducir conversiones automáticas entre unidades.
- Añadir validaciones o fallbacks que no formen parte del contrato definido.

## Contrato funcional

### Firma

```scss
@function pb($attr: ());
```

### Parámetros

| Clave | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `base \| b` | Number | `1920` | Define la base de referencia usada para calcular la medida. |
| `unit \| u` | String | `"px"` | Define la unidad concatenada al resultado. |
| `value \| v` | Number | `0` | Define el porcentaje que se calculará respecto a la base. |

La clave principal debe preceder a su alias al resolver el valor, de acuerdo con
la interfaz existente de `bp`.

### Cálculo

La función debe calcular:

```text
(value * base) / 100
```

Después debe concatenar `unit` al resultado calculado.

### Ejemplos de resultado

```scss
pb((value: 20, base: 1920, unit: "px"));
// 384px

pb((v: 50, b: 1200, u: "rem"));
// 600rem

pb((value: 20));
// 384px

pb(());
// 0px
```

Los valores fuera del rango habitual de porcentajes deben conservar su sentido
matemático:

```scss
pb((value: -10, base: 500));
// -50px

pb((value: 125, base: 200));
// 250px

pb((value: 20, base: 0));
// 0px
```

## Relación con `bp`

La relación entre ambas funciones es conceptual y matemática:

```scss
bp((value: 384, base: 1920, unit: "vw"));
// 20vw

pb((value: 20, base: 1920, unit: "px"));
// 384px
```

`pb` no debe leer, analizar ni convertir el valor con unidad generado por `bp`.
El consumidor proporcionará a `pb` el porcentaje como un número.

## Documentación

La sección de `pb` debe:

- Mantener la estructura visual y editorial de `docs/components/base/bp.html`.
- Identificar `pb` como `Tipo: Function` y usar la versión `2.x.x`.
- Referenciar el archivo fuente según la convención vigente para funciones de
  base.
- Explicar en español qué recibe, qué calcula y qué devuelve.
- Mostrar la firma map y una tabla con las claves, tipos, defaults y
  descripciones definidos en esta especificación.
- Incluir un único ejemplo completo presentado mediante `TabPanel`, en el orden
  `Resultado`, `SCSS`, `CSS generado` y `HTML`.
- Usar como ejemplo principal la conversión de `20` sobre una base de `1920` a
  `384px`.
- Incorporarse a la categoría `Funciones / Responsive / Unidades` de la página
  base.
- Ser localizable mediante el buscador global y abrir el ancla correspondiente
  a `pb`.

## Criterios de aceptación

1. Existe una función `pb` con la firma `@function pb($attr: ());`.
2. `pb((value: 20, base: 1920, unit: "px"))` devuelve `384px`.
3. `pb((value: 20))` devuelve `384px` mediante los defaults definidos.
4. `pb(())` devuelve `0px`.
5. Las claves abreviadas `b`, `u` y `v` producen el mismo comportamiento que
   sus claves largas equivalentes.
6. Los valores negativos y superiores a `100` se calculan sin limitarse.
7. Una base igual a `0` devuelve `0` con la unidad indicada.
8. `bp` conserva su comportamiento actual.
9. La página base muestra la nueva sección en la categoría
   `Funciones / Responsive / Unidades`.
10. El ejemplo documentado mantiene sincronizados su SCSS, CSS generado, HTML
    y resultado visual.
11. El índice de búsqueda contiene `pb` y dirige a la página base con su ancla
    correcta.
12. Las tareas de compilación, lint, generación del buscador y validación JSON
    aplicables finalizan correctamente.

## Verificación prevista

- Comprobar los resultados principales, los defaults, los alias y los valores
  fuera del rango habitual mediante una compilación Sass dirigida.
- Ejecutar la compilación SCSS de la documentación para actualizar el CSS del
  ejemplo.
- Ejecutar el lint de la documentación.
- Regenerar el índice de búsqueda y validar sus archivos JSON.
- Inspeccionar una búsqueda representativa de `pb` y confirmar que su resultado
  usa el ancla correcta.
- Verificar que el `TabPanel` del ejemplo se inicializa y conserva cargados los
  recursos declarados mediante `data-src`.
