export type ButtonPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'header';
export type WrapMode = 'wrap' | 'attribute' | 'custom-element';
export type DrawerTheme = 'auto' | 'dark' | 'light';
export interface RehypeNanoCodeOptions {
    /**
     * Text to display on the explanation trigger button.
     * @default "Explain with AI"
     */
    buttonText?: string;
    /**
     * Position of the explanation button relative to the code block.
     * @default "top-right"
     */
    buttonPosition?: ButtonPosition;
    /**
     * Whitelist of programming languages to enable AI explainer for.
     * If not set, all languages are eligible (unless excluded by excludeLanguages).
     */
    languages?: string[];
    /**
     * Blacklist of programming languages to exclude from AI explainer.
     * @default ["text", "plaintext", "console", "sh", "shell", "bash", "zsh"]
     */
    excludeLanguages?: string[];
    /**
     * Minimum number of lines in a code block to attach the AI explainer.
     * @default 1
     */
    minLines?: number;
    /**
     * Custom system prompt / instruction provided to Gemini Nano.
     */
    systemPrompt?: string;
    /**
     * Sampling temperature for the model.
     * @default 0.2
     */
    temperature?: number;
    /**
     * Top-K sampling parameter.
     */
    topK?: number;
    /**
     * How the rehype AST transformer applies the custom element:
     * - "wrap": Wraps `<pre>` within `<code-nano-explainer>` custom element.
     * - "custom-element": Replaces or enhances the container as `<code-nano-explainer>`.
     * - "attribute": Injects data attributes (`data-nano-explainer`, `data-code-raw`, `data-lang`) onto `<pre>`.
     * @default "wrap"
     */
    wrapMode?: WrapMode;
    /**
     * Whether to inject default lightweight CSS styles for the button, drawer, and streaming output.
     * @default true
     */
    injectStyles?: boolean;
    /**
     * Whether to include a copy explanation button in the drawer.
     * @default true
     */
    copyExplanation?: boolean;
    /**
     * Theme mode for the explanation drawer.
     * @default "auto"
     */
    drawerTheme?: DrawerTheme;
}
export interface NanoExplainStartDetail {
    code: string;
    lang: string;
}
export interface NanoExplainChunkDetail {
    code: string;
    lang: string;
    chunk: string;
    fullText: string;
}
export interface NanoExplainCompleteDetail {
    code: string;
    lang: string;
    explanation: string;
}
export interface NanoExplainErrorDetail {
    code: string;
    lang: string;
    error: Error | unknown;
}
//# sourceMappingURL=types.d.ts.map