import type { ChromeAI, AILanguageModel } from '../chrome-ai.js';
import type {
  NanoExplainStartDetail,
  NanoExplainChunkDetail,
  NanoExplainCompleteDetail,
  NanoExplainErrorDetail
} from '../types.js';

const STYLES = `
code-nano-explainer {
  display: block;
  position: relative;
  margin: 1.5rem 0;
  font-family: inherit;
}

code-nano-explainer .nano-btn-container {
  position: absolute;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

code-nano-explainer[data-button-position="top-right"] .nano-btn-container,
code-nano-explainer:not([data-button-position]) .nano-btn-container {
  top: 0.5rem;
  right: 0.5rem;
}

code-nano-explainer[data-button-position="top-left"] .nano-btn-container {
  top: 0.5rem;
  left: 0.5rem;
}

code-nano-explainer[data-button-position="bottom-right"] .nano-btn-container {
  bottom: 0.5rem;
  right: 0.5rem;
}

code-nano-explainer[data-button-position="bottom-left"] .nano-btn-container {
  bottom: 0.5rem;
  left: 0.5rem;
}

code-nano-explainer .nano-explain-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  color: var(--nano-btn-color, #f3f4f6);
  background: var(--nano-btn-bg, rgba(30, 41, 59, 0.85));
  border: 1px solid var(--nano-btn-border, rgba(255, 255, 255, 0.15));
  border-radius: 0.375rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.15s ease-in-out;
  user-select: none;
}

code-nano-explainer .nano-explain-btn:hover:not(:disabled) {
  background: var(--nano-btn-hover-bg, rgba(51, 65, 85, 0.95));
  border-color: var(--nano-btn-hover-border, rgba(255, 255, 255, 0.3));
  transform: translateY(-1px);
}

code-nano-explainer .nano-explain-btn:active:not(:disabled) {
  transform: translateY(0);
}

code-nano-explainer .nano-explain-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

code-nano-explainer .nano-sparkle {
  color: var(--nano-sparkle-color, #38bdf8);
  font-size: 0.85rem;
}

code-nano-explainer .nano-drawer {
  margin-top: 0.5rem;
  background: var(--nano-drawer-bg, #0f172a);
  border: 1px solid var(--nano-drawer-border, #334155);
  border-radius: 0.5rem;
  overflow: hidden;
  color: var(--nano-drawer-color, #e2e8f0);
  font-size: 0.875rem;
  line-height: 1.6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease-in-out;
}

code-nano-explainer .nano-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--nano-header-bg, rgba(255, 255, 255, 0.03));
  border-bottom: 1px solid var(--nano-drawer-border, #334155);
  font-size: 0.75rem;
}

code-nano-explainer .nano-drawer-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--nano-title-color, #f8fafc);
}

code-nano-explainer .nano-badge {
  display: inline-block;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  background: var(--nano-badge-bg, rgba(56, 189, 248, 0.15));
  color: var(--nano-badge-color, #38bdf8);
  font-size: 0.7rem;
  text-transform: uppercase;
  font-family: monospace;
}

code-nano-explainer .nano-drawer-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

code-nano-explainer .nano-action-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--nano-action-color, #94a3b8);
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

code-nano-explainer .nano-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

code-nano-explainer .nano-drawer-body {
  padding: 0.875rem 1rem;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

code-nano-explainer .nano-drawer-body pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}

code-nano-explainer .nano-drawer-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.25rem;
  border-radius: 0.2rem;
}

code-nano-explainer .nano-cursor {
  display: inline-block;
  width: 6px;
  height: 1em;
  background: #38bdf8;
  vertical-align: middle;
  margin-left: 2px;
  animation: nano-blink 1s infinite;
}

@keyframes nano-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

code-nano-explainer .nano-progress-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.5rem;
}

code-nano-explainer .nano-progress-bar {
  height: 100%;
  background: #38bdf8;
  transition: width 0.2s ease;
}

code-nano-explainer .nano-notice {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  font-size: 0.8rem;
}

code-nano-explainer .nano-notice a {
  color: #38bdf8;
  text-decoration: underline;
}
`;

function injectStylesOnce() {
  if (typeof document === 'undefined') return;
  const styleId = 'astro-rehype-nano-code-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }
}

const BaseElement: typeof HTMLElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as any);

/**
 * Custom Element: <code-nano-explainer>
 * Attaches an on-demand AI explanation button and streaming output drawer to code blocks.
 */
export class CodeNanoExplainer extends BaseElement {
  private buttonEl: HTMLButtonElement | null = null;
  private drawerEl: HTMLDivElement | null = null;
  private bodyEl: HTMLDivElement | null = null;
  private copyBtnEl: HTMLButtonElement | null = null;
  private activeSession: AILanguageModel | null = null;
  private cachedExplanation: string = '';
  private isGenerating: boolean = false;
  private isDrawerOpen: boolean = false;

  static get observedAttributes() {
    return ['data-lang', 'data-button-text', 'data-button-position'];
  }

  connectedCallback() {
    injectStylesOnce();
    this.render();
  }

  disconnectedCallback() {
    if (this.activeSession) {
      try {
        this.activeSession.destroy();
      } catch {}
      this.activeSession = null;
    }
  }

  private get rawCode(): string {
    const attr = this.getAttribute('data-code-raw');
    if (attr) return attr;
    const codeEl = this.querySelector('code');
    return codeEl ? codeEl.textContent || '' : this.textContent || '';
  }

  private get language(): string {
    return this.getAttribute('data-lang') || 'code';
  }

  private get buttonText(): string {
    return this.getAttribute('data-button-text') || 'Explain with AI';
  }

  private get systemPrompt(): string {
    return (
      this.getAttribute('data-system-prompt') ||
      'You are an expert software engineer and technical educator. Explain the provided code snippet clearly, step-by-step. Focus on the core logic, purpose, edge cases, and best practices. Format your explanation concisely using clean markdown.'
    );
  }

  private get temperature(): number {
    const t = this.getAttribute('data-temperature');
    return t ? parseFloat(t) : 0.2;
  }

  private render() {
    if (this.querySelector('.nano-btn-container')) return;

    // Create button container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'nano-btn-container';

    // Create trigger button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nano-explain-btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', `Explain ${this.language} code block with local AI`);
    btn.innerHTML = `<span class="nano-sparkle" aria-hidden="true">✨</span> <span class="nano-btn-label">${this.buttonText}</span>`;

    btn.addEventListener('click', () => this.handleButtonClick());
    this.buttonEl = btn;
    btnContainer.appendChild(btn);

    this.prepend(btnContainer);
  }

  private async handleButtonClick() {
    if (this.isGenerating) return;

    if (this.isDrawerOpen) {
      this.closeDrawer();
      return;
    }

    if (this.cachedExplanation) {
      this.openDrawer();
      return;
    }

    await this.startExplanation();
  }

  private openDrawer() {
    this.ensureDrawerElement();
    if (this.drawerEl) {
      this.drawerEl.removeAttribute('hidden');
      this.isDrawerOpen = true;
      this.buttonEl?.setAttribute('aria-expanded', 'true');
      this.updateButtonLabel('Hide Explanation');
    }
  }

  private closeDrawer() {
    if (this.drawerEl) {
      this.drawerEl.setAttribute('hidden', '');
      this.isDrawerOpen = false;
      this.buttonEl?.setAttribute('aria-expanded', 'false');
      this.updateButtonLabel(this.cachedExplanation ? 'View Explanation' : this.buttonText);
    }
  }

  private updateButtonLabel(label: string) {
    if (this.buttonEl) {
      const labelSpan = this.buttonEl.querySelector('.nano-btn-label');
      if (labelSpan) {
        labelSpan.textContent = label;
      }
    }
  }

  private ensureDrawerElement(): HTMLDivElement {
    if (this.drawerEl) return this.drawerEl;

    const drawer = document.createElement('div');
    drawer.className = 'nano-drawer';
    drawer.setAttribute('role', 'region');
    drawer.setAttribute('aria-label', 'Code explanation drawer');
    drawer.setAttribute('aria-live', 'polite');

    const header = document.createElement('div');
    header.className = 'nano-drawer-header';

    const title = document.createElement('div');
    title.className = 'nano-drawer-title';
    title.innerHTML = `<span>✨ Gemini Nano Explanation</span> <span class="nano-badge">${this.language}</span>`;

    const actions = document.createElement('div');
    actions.className = 'nano-drawer-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'nano-action-btn nano-copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.title = 'Copy explanation to clipboard';
    copyBtn.addEventListener('click', () => this.copyExplanation());
    this.copyBtnEl = copyBtn;

    const reExplainBtn = document.createElement('button');
    reExplainBtn.type = 'button';
    reExplainBtn.className = 'nano-action-btn nano-re-explain-btn';
    reExplainBtn.textContent = 'Re-explain';
    reExplainBtn.title = 'Generate a new explanation';
    reExplainBtn.addEventListener('click', () => this.startExplanation(true));

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'nano-action-btn nano-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close drawer';
    closeBtn.addEventListener('click', () => this.closeDrawer());

    actions.appendChild(copyBtn);
    actions.appendChild(reExplainBtn);
    actions.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'nano-drawer-body';
    this.bodyEl = body;

    drawer.appendChild(header);
    drawer.appendChild(body);

    this.appendChild(drawer);
    this.drawerEl = drawer;
    return drawer;
  }

  private async copyExplanation() {
    if (!this.cachedExplanation) return;
    try {
      await navigator.clipboard.writeText(this.cachedExplanation);
      if (this.copyBtnEl) {
        this.copyBtnEl.textContent = 'Copied!';
        setTimeout(() => {
          if (this.copyBtnEl) this.copyBtnEl.textContent = 'Copy';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy explanation:', err);
    }
  }

  private formatMarkdownToHtml(markdown: string): string {
    // Lightweight markdown formatter for real-time streaming safety
    let html = markdown
      // Escape HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```lang\ncode\n```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, _lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');

    // Bold & italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet points
    html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Paragraphs
    html = html.replace(/\n\n+/g, '<br/><br/>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  public async startExplanation(forceReload = false) {
    if (this.isGenerating) return;

    this.openDrawer();
    const body = this.bodyEl;
    if (!body) return;

    if (!forceReload && this.cachedExplanation) {
      body.innerHTML = this.formatMarkdownToHtml(this.cachedExplanation);
      return;
    }

    this.isGenerating = true;
    if (this.buttonEl) this.buttonEl.disabled = true;
    this.updateButtonLabel('Explaining...');

    body.innerHTML = '<div class="nano-loading">Connecting to Chrome Built-in AI (Gemini Nano)...</div>';

    const code = this.rawCode;
    const lang = this.language;

    // Dispatch custom event: nano-explain-start
    this.dispatchEvent(
      new CustomEvent<NanoExplainStartDetail>('nano-explain-start', {
        bubbles: true,
        composed: true,
        detail: { code, lang }
      })
    );

    try {
      const win = window as any;
      const ai: ChromeAI | undefined = win.ai;

      if (!ai || !ai.languageModel) {
        throw new Error('CHROME_AI_UNAVAILABLE');
      }

      const capabilities = await ai.languageModel.capabilities();
      if (capabilities.available === 'no') {
        throw new Error('CHROME_AI_DISABLED');
      }

      let monitorCallback;
      if (capabilities.available === 'after-download') {
        body.innerHTML = `
          <div class="nano-status">
            <span>Gemini Nano model download in progress...</span>
            <div class="nano-progress-bar-container">
              <div class="nano-progress-bar" style="width: 10%"></div>
            </div>
          </div>
        `;
        monitorCallback = (m: any) => {
          m.addEventListener('downloadprogress', (e: any) => {
            const pct = Math.round((e.loaded / e.total) * 100) || 0;
            const bar = body.querySelector('.nano-progress-bar') as HTMLElement;
            if (bar) bar.style.width = `${pct}%`;
          });
        };
      }

      if (this.activeSession) {
        try {
          this.activeSession.destroy();
        } catch {}
        this.activeSession = null;
      }

      this.activeSession = await ai.languageModel.create({
        systemPrompt: this.systemPrompt,
        temperature: this.temperature,
        monitor: monitorCallback
      });

      const promptText = `Explain the following ${lang} code block concisely and accurately. Break down the logic step-by-step:\n\n\`\`\`${lang}\n${code}\n\`\`\``;

      body.innerHTML = '<span class="nano-streaming-text"></span><span class="nano-cursor"></span>';
      const textSpan = body.querySelector('.nano-streaming-text') as HTMLElement;

      let fullExplanation = '';
      const stream = this.activeSession.promptStreaming(promptText);

      // Handle streaming ReadableStream
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          fullExplanation = value;
          textSpan.innerHTML = this.formatMarkdownToHtml(fullExplanation);
          body.scrollTop = body.scrollHeight;

          // Dispatch event: nano-explain-chunk
          this.dispatchEvent(
            new CustomEvent<NanoExplainChunkDetail>('nano-explain-chunk', {
              bubbles: true,
              composed: true,
              detail: { code, lang, chunk: value, fullText: fullExplanation }
            })
          );
        }
      }

      // Finished streaming
      const cursor = body.querySelector('.nano-cursor');
      if (cursor) cursor.remove();

      this.cachedExplanation = fullExplanation;
      textSpan.innerHTML = this.formatMarkdownToHtml(fullExplanation);

      // Dispatch event: nano-explain-complete
      this.dispatchEvent(
        new CustomEvent<NanoExplainCompleteDetail>('nano-explain-complete', {
          bubbles: true,
          composed: true,
          detail: { code, lang, explanation: fullExplanation }
        })
      );
    } catch (err: any) {
      console.error('[astro-rehype-nano-code] Explanation error:', err);

      let errorMessage = 'An error occurred while generating the explanation.';
      let isFallbackNotice = false;

      if (err.message === 'CHROME_AI_UNAVAILABLE' || err.message === 'CHROME_AI_DISABLED') {
        isFallbackNotice = true;
        errorMessage = `
          <div class="nano-notice">
            <strong>Chrome Built-in AI (Gemini Nano) not detected.</strong><br/>
            To enable local on-device AI explanations:
            <ol style="margin: 0.5rem 0 0.5rem 1.25rem; padding: 0;">
              <li>Open Google Chrome (version 128+).</li>
              <li>Go to <code>chrome://flags/#prompt-api-for-gemini-nano</code> and set to <strong>Enabled</strong>.</li>
              <li>Go to <code>chrome://flags/#optimization-guide-on-device-model</code> and set to <strong>Enabled BypassPerfRequirement</strong>.</li>
              <li>Restart Chrome and open <code>chrome://components</code>, then click <em>Check for update</em> on <strong>Optimization Guide On Device Model</strong>.</li>
            </ol>
          </div>
        `;
      } else {
        errorMessage = `<div class="nano-notice">Failed to generate explanation: ${err.message || 'Unknown error'}. Please try again.</div>`;
      }

      body.innerHTML = errorMessage;

      // Dispatch event: nano-explain-error
      this.dispatchEvent(
        new CustomEvent<NanoExplainErrorDetail>('nano-explain-error', {
          bubbles: true,
          composed: true,
          detail: { code, lang, error: err }
        })
      );
    } finally {
      this.isGenerating = false;
      if (this.buttonEl) {
        this.buttonEl.disabled = false;
        this.updateButtonLabel(this.cachedExplanation ? 'Hide Explanation' : this.buttonText);
      }
    }
  }
}

// Auto-register custom element if in browser environment
if (typeof customElements !== 'undefined' && !customElements.get('code-nano-explainer')) {
  customElements.define('code-nano-explainer', CodeNanoExplainer);
}

export default CodeNanoExplainer;
