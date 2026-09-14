import { CompilerOptions } from './types';
import { compileUReact } from './transform';

export interface UReactPluginOptions extends CompilerOptions {
  /**
   * Files to include in the compilation step
   * @default /\.(tsx|jsx|ts|js)$/
   */
  include?: RegExp | string[];

  /**
   * Files to exclude
   * @default /node_modules/
   */
  exclude?: RegExp | string[];
}

/**
 * uReact v3.0 Vite / Rollup Ahead-of-Time Compiler Plugin
 *
 * Automatically intercepts React & TypeScript source files, transforming
 * direct store mutations, $bind bindings, and JSX signals into zero-overhead
 * atomic patches at build time.
 *
 * Usage:
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { ureactCompilerPlugin } from 'ureact/compiler';
 *
 * export default defineConfig({
 *   plugins: [
 *     ureactCompilerPlugin({ optimizeMutations: true, signalDomPruning: true }),
 *     react()
 *   ]
 * });
 * ```
 */
export function ureactCompilerPlugin(options: UReactPluginOptions = {}) {
  const includeRegex = options.include instanceof RegExp ? options.include : /\.(tsx|jsx|ts|js)$/;
  const excludeRegex = options.exclude instanceof RegExp ? options.exclude : /node_modules/;

  return {
    name: 'vite-plugin-ureact-compiler',
    enforce: 'pre' as const,

    transform(code: string, id: string) {
      if (excludeRegex.test(id)) return null;
      if (!includeRegex.test(id)) return null;

      // Only transform files that interact with ureact stores, signals, or view
      if (
        !code.includes('createStore') &&
        !code.includes('signal') &&
        !code.includes('store.') &&
        !code.includes('$bind') &&
        !code.includes('.value') &&
        !code.includes('ureact')
      ) {
        return null;
      }

      const result = compileUReact(code, options);
      if (!result.transformed) return null;

      return {
        code: result.code,
        map: null
      };
    }
  };
}

export default ureactCompilerPlugin;
