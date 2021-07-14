# General

Swip app is using Sass for applying styles to pages and components.

We are using Scss (Sassy Css) syntax as this is more or less the only option going forward when working with Sass.

We try to follow the guidelines from the [sass-guidelines page](https://sass-guidelin.es/)

## Architecture

The architecture for the scss files follows the [7:1 pattern](https://sass-guidelin.es/#architecture)

Note however that all scss files are found in the styles folder.

And we're using a styles.scss file instead of a "main.scss".

## Vendor Files

- Styles from vendors are put in the `styles\vendor` folder and should generally not be modified.
- We are using overrides in cases where we want to override some css from the vendor styles.
  For example: `styles\vendor\highcharts\overrides`
- In the cases where they have variables that can be overridden we're putting those in a variables file:
  Example: `styles\vendor\highcharts\overrides\_variables.scss`
- When we need to override default behavior of the vendor styles we're putting that code in a styles file:
  Example: `styles\vendor\highcharts\overrides\_styles.scss`

## MAJOR EXCEPTION

The layout files in PRIME-NG template loads a number of files that referenced by relative URL:s.

The default sass loader will use the base path of the initially loaded sass file, i.e., the entrypoint.  
In our case this is styles.scss

This causes an exception if we are trying to import the layout file in the styles.scss file since  
prime-ng layout.scss have to be loaded at root level.

As a workaround we are loading the layout-swimbird.scss file directly as a style import in our `angular.json`.

## CSS Naming convention

For our own css class names we are prefixing with `sb-` to avoid any clashes in class names and for easier
overview of what our own styles are and what belongs to a third party framework.

css classes are named using hyphens , i.e., spinal-case - do not use camelCase since it's not css standard.  
camelCase can be used for scss variables.

## Hacks!

Any temporary hack is placed in the `_shame.scss` file and is considered a technical debt.

## Theming (*********************** This Primeng vendor is not in use now *************************)

At the moment we are theming in three different files:

1. `styles\vendors\primeng\layout\css\layout-swimbird.scss`
2. `styles\vendors\primeng\theme\theme-swimbird.scss`  
   NOTE: We can also override our own styles for theme and layout in:  
   `styles\vendors\primeng\sass\overrides\_theme-variables.scss`  
   And `styles\vendors\primeng\sass\overrides\_layout-variables.scss`
3. `styles\abstracts\variables`  
   In the variables file we are setting some color properties, fonts etc


## Styles structure

1. `src\styles\styles.scss` file has all the imports
2. `src\styles\_sb_main_styles.scss` file has all the styles for all the common modules and primeng main scss files styles are also moved in here
3. `src\styles\layout\_sb_layout_styles.scss` file has all the layout styles and all the layout styles from the primeng are moved in here in this file
4. `src\styles\layout\_sb_print_styles.scss` file contains styles related to print screen only.
5. `src\styles\components\_sb_material_ui.scss` file contains styles to override the material UI defaults
6. `src\styles\abstracts` folder contains some generic application's assets
    - `_icon.scss` file
    - `_mixin.scss` file
    - `_sb_fonts.scss` file
    - `_sb_layout_variables.scss` file
    - `variables.scss` file

## New Theming structure

1. `src\styles\themes` contains common themes (basically moved in all the themes here)
2. `src\styles\material-theme` folder contains `swimbird-theme.scss` file, which is new material themeing file, so in case of any changes required to be done in the theme of the application, can be done from here.