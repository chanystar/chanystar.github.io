# TECH

## Native
- native code is code written specifically for a certain processor
- https://en.wikipedia.org/wiki/Native_(computing)
### Native Mechanism
- https://komh.github.io/os2books/os2tk45/pm4/1414_L4_NativeMechanismActio.html

## Vite

### why Vite
- Before ES modules were available in browsers, developers had no native mechanism for authoring JavaScript in a modularized fashion. This is why we are all familiar with the concept of "bundling"
- It is not uncommon for large scale projects to contain thousands of modules.
- We are starting to hit a performance bottleneck for JavaScript based tooling
- Vite aims to address these issues by leveraging new advancements in the ecosystem
- The availablility of native ES modules in the browser
- The rise of JavaScript tools written in compile-to-native languages

### Slow Server Start
- Vite improves the dev server start time by first dividing the modules in an application into two categories
    - dependencies and source code
- Vite pre-bundles dependencies using esbuild
    - esbuild is written in Go and pre-bundles dependencies 10-100x faster than JavaScript-based bundlers.

- Vite serves source code over native ESM