import type { AstroIntegration } from 'astro';
import { rehypeNanoCodePlugin } from './rehype-plugin.js';
import type { RehypeNanoCodeOptions } from './types.js';

export * from './types.js';
export * from './rehype-plugin.js';
export type * from './chrome-ai.js';

/**
 * Astro integration for Chrome Built-in AI (Gemini Nano) markdown code block explanations.
 * Automatically wires markdown `<pre><code>` blocks at build time and injects zero-overhead client logic.
 */
export function rehypeNanoCode(options: RehypeNanoCodeOptions = {}): AstroIntegration {
  return {
    name: 'astro-rehype-nano-code',
    hooks: {
      'astro:config:setup': ({ updateConfig, injectScript }) => {
        // Inject Rehype plugin into markdown configuration
        updateConfig({
          markdown: {
            rehypePlugins: [[rehypeNanoCodePlugin, options]]
          }
        });

        // Inject lightweight custom element script into the page bundle
        injectScript('page', `import 'astro-rehype-nano-code/client';`);
      }
    }
  };
}

export default rehypeNanoCode;
