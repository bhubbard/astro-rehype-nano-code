import type { AstroIntegration } from 'astro';
import type { RehypeNanoCodeOptions } from './types.js';
export * from './types.js';
export * from './rehype-plugin.js';
export type * from './chrome-ai.js';
/**
 * Astro integration for Chrome Built-in AI (Gemini Nano) markdown code block explanations.
 * Automatically wires markdown `<pre><code>` blocks at build time and injects zero-overhead client logic.
 */
export declare function rehypeNanoCode(options?: RehypeNanoCodeOptions): AstroIntegration;
export default rehypeNanoCode;
//# sourceMappingURL=index.d.ts.map