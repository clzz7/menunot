import { Project } from "ts-morph";
import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

// List of external packages that shouldn't have .js extensions
const externalPackages = [
  '@tanstack/react-query',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-toast',
  '@radix-ui/react-slot',
  '@radix-ui/react-separator',
  '@radix-ui/react-tabs',
  '@hookform/resolvers',
  '@radix-ui/react-dialog',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-label',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-switch',
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-slider',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  'react-hook-form',
  'lucide-react',
  'react',
  'react-dom',
  'wouter',
  'framer-motion',
  'date-fns',
  'recharts',
  'zod'
];

async function fixImports() {
  const project = new Project({ tsConfigFilePath: "tsconfig.json" });
  
  project.getSourceFiles("client/src/**/*.{ts,tsx}").forEach((source) => {
    source.getImportDeclarations().forEach((imp) => {
      const spec = imp.getModuleSpecifierValue();
      
      // Check if this is an external package with .js extension
      const basePackage = spec.replace('.js', '');
      if (externalPackages.some(pkg => basePackage.startsWith(pkg))) {
        // Remove .js extension for external packages
        imp.setModuleSpecifier(basePackage);
      }
    });
  });
  
  await project.save();
  console.log("✔ Fixed external package imports");
}

await fixImports();