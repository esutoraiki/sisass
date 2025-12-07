# SISASS

Simple Interface for SASS

# Requirements

- Minimum Node  v16.7.0
- Recommended Sass CLI: `sass` 1.63.4 (tested)

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

# Quick start with Sass 1.63.4

1. Install Sass CLI 1.63.4 locally (or use `npx`):
   
   ```bash
   npx sass@1.63.4 --version
   ```
2. Create a small entry file (example if you installed to `assets/scss/`):
   
   ```scss
   // assets/scss/main.scss
   @import "core/variables";
   @import "core/base";
   @import "core/mediaqueries";
   @import "core/fonts";
   @import "core/reset";
   @import "core/keyframes";
   @import "core/layout";
   @import "core/mixin";
   @import "core/silents_class";
   ```
3. Compile with Sass 1.63.4:
   
   ```bash
   npx sass@1.63.4 assets/scss/main.scss assets/css/main.css --load-path assets/scss
   ```
4. Import the generated `assets/css/main.css` in your HTML.

> Tip: The documentation site uses `docs/assets/scss/main.scss` as a working example; you can copy that structure into your project.

# Documentation

[https://esutoraiki.github.io/sisass/](https://esutoraiki.github.io/sisass/)
