import type { RehypeNanoCodeOptions } from './types.js';
export interface HastNode {
    type: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, any>;
    children?: HastNode[];
}
/**
 * Extracts plain text from a HAST node tree.
 */
export declare function extractRawText(node: HastNode): string;
/**
 * Extracts programming language from a code/pre node.
 */
export declare function extractLanguage(codeNode?: HastNode, preNode?: HastNode): string;
/**
 * Rehype plugin for nano code explanation.
 * Inspects <pre><code> blocks, extracts raw code & language, and wraps with <code-nano-explainer>.
 */
export declare function rehypeNanoCodePlugin(options?: RehypeNanoCodeOptions): (tree: HastNode) => void;
export default rehypeNanoCodePlugin;
//# sourceMappingURL=rehype-plugin.d.ts.map