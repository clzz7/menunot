import { Project } from "ts-morph";

/**
 * Codemod: append ".js" to every local/alias import specifier that currently
 * has no extension. Intended to be run **once** after cloning the repo when you
 * need pure Node16 ESM resolution (which requires explicit extensions).
 *
 *   npx ts-node scripts/add-extensions.ts
 */

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const exts = [".tsx", ".ts", ".jsx", ".js"];

project.getSourceFiles("client/src/**/*.{ts,tsx}").forEach((source) => {
  source.getImportDeclarations().forEach((imp) => {
    const spec = imp.getModuleSpecifierValue();
    // only rewrite relative or alias (@/) paths, skip packages
    if (/^[.@]/.test(spec) === false) return;

    // skip if already has explicit extension
    if (exts.some((e) => spec.endsWith(e))) return;

    // append .js for runtime (bundler will map back to .tsx at build time)
    imp.setModuleSpecifier(`${spec}.js`);
  });
});

await project.save();

console.log("✔ All imports updated with .js extension");