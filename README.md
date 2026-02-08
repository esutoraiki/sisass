# SISASS

Simple Interface for SASS

# Requirements

- Minimum Node  v16.7.0
- Recommended Sass CLI: `sass` 1.97.3 (tested)

# Installation

1. Open a terminal at the root of your project.
2. (Optional for empty projects) initialize `package.json`:
   
   ```bash
   npm init -y
   ```
3. Install SISASS:
   
   ```bash
   npm i sisass
   ```
4. Run the asset installer:

```bash
npm explore sisass -- npm run init
```

This will install sisass at the root of the project in the **assets** folder. If you want to change the **resource** folder (for example), use the path parameter like so:

```bash
npm explore sisass -- npm run init -- --path ../../resources/
```

# Quick start with Sass 1.97.3 (SISASS 2.x.x)

1. Install Sass CLI 1.97.3 locally (or use `npx`):
   
   ```bash
   npx sass@1.97.3 --version
   ```
2. Create a small entry file (example if you installed to `assets/scss/`):
   
   ```scss
   // assets/scss/main.scss
   @use "sisass" as s;

   // Optional CSS modules (emit CSS when used)
   @use "reset";

   .button {
       @include s.button_simple();
       font-size: s.szrem(16);
   }
   ```
3. Compile with Sass 1.97.3:
   
   ```bash
   npx sass@1.97.3 assets/scss/main.scss assets/css/main.css --load-path assets/scss
   ```
4. Import the generated `assets/css/main.css` in your HTML.

> Tip: The documentation site uses `docs/assets/scss/main.scss` as a working example; you can copy that structure into your project.

# Migration to SISASS 2.x.x (@use / @forward)

## Breaking changes

- `@import` is no longer supported. Use `@use` / `@forward`.
- Globals are no longer injected. Mixins, functions, and variables must be accessed
  through a namespace (recommended) or via the legacy entrypoint.
- Vendor mixins are no longer reachable via `base` alone. Use the SISASS module.

## Upgrade guide (1.x → 2.x)

1. Replace `@import` with `@use` / `@forward`.
2. Add a namespace:
   - `@use "sisass" as s;`
3. Prefix all SISASS calls:
   - `@include s.button_simple();`
   - `font-size: s.szrem(16);`
4. If you need globals temporarily:
   - `@use "sisass/legacy" as *;` (not recommended for long-term use)

- Namespaced usage (safest):
  - `@use "sisass" as s;`
  - `@include s.button_simple();`
  - `font-size: s.szrem(16);`
- Unprefixed usage (allowed, may collide):
  - `@use "sisass/legacy" as *;`
  - `@include button_simple();`

You can configure default variables via `@use "sisass" with (...)` if needed.

## Avoiding collisions without prefixes

If you choose unprefixed usage, any mixin or variable name can collide with your own.
To avoid this, namespace your own modules and variables, for example:

```scss
@use "my_project/mixins" as my;

.button {
    @include my.button_simple();
}
```

## Variables configuration

All SISASS variables are defined with `!default`, so you can override them at import.
If you prefer to use variables without a namespace in your project, use `as *`:

```scss
@use "sisass" as s;
@use "core/variables" as *;

.button {
    color: $c1;
    @include s.button_simple();
}
```

You can also override values at import:

```scss
@use "sisass" with (
    $c1: #ffffff,
    $c2: #000000,
    $f1: "Inter, sans-serif",
    $b6: 1024
);
```

## Module overview

- Core utilities: `base`, `vendor`, `mediaqueries`, `reset`
- Components: `buttons`, `carousel`, `modal`
- Effects: `effects`, `flipcard`, `glitch`, `glitch_keyframes`
- Shapes: `triangles`

## Why `@use` fixes vendor mixins

In SISASS 1.x, `@import "base"` pulled globals. With `@use`, modules do not re-export
their dependencies, so vendor mixins like `border-radius` are **not** visible through
`base`. The solution in 2.x is to call mixins directly from the SISASS module:

```scss
@use "sisass" as s;

.box {
    @include s.border-radius(50%);
}
```

# Documentation

[https://esutoraiki.github.io/sisass/](https://esutoraiki.github.io/sisass/)
