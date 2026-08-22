declare const BaseElement: typeof HTMLElement;
/**
 * Custom Element: <code-nano-explainer>
 * Attaches an on-demand AI explanation button and streaming output drawer to code blocks.
 */
export declare class CodeNanoExplainer extends BaseElement {
    private buttonEl;
    private drawerEl;
    private bodyEl;
    private copyBtnEl;
    private activeSession;
    private cachedExplanation;
    private isGenerating;
    private isDrawerOpen;
    static get observedAttributes(): string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    private get rawCode();
    private get language();
    private get buttonText();
    private get systemPrompt();
    private get temperature();
    private render;
    private handleButtonClick;
    private openDrawer;
    private closeDrawer;
    private updateButtonLabel;
    private ensureDrawerElement;
    private copyExplanation;
    private formatMarkdownToHtml;
    startExplanation(forceReload?: boolean): Promise<void>;
}
export default CodeNanoExplainer;
//# sourceMappingURL=code-nano-explainer.d.ts.map