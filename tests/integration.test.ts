import { describe, it, expect, mock } from 'bun:test';
import { rehypeNanoCode } from '../src/index.js';
import { CodeNanoExplainer } from '../src/components/code-nano-explainer.js';

describe('Astro Integration (rehypeNanoCode)', () => {
  it('returns valid AstroIntegration object with name and hooks', () => {
    const integration = rehypeNanoCode({ buttonText: 'Analyze Code' });
    expect(integration.name).toBe('astro-rehype-nano-code');
    expect(typeof integration.hooks?.['astro:config:setup']).toBe('function');
  });

  it('correctly updates Astro markdown config and injects client script', () => {
    const integration = rehypeNanoCode({ minLines: 2 });
    const updateConfigMock = mock(() => {});
    const injectScriptMock = mock(() => {});

    const setupHook = integration.hooks?.['astro:config:setup'];
    if (typeof setupHook === 'function') {
      (setupHook as any)({
        updateConfig: updateConfigMock,
        injectScript: injectScriptMock
      });
    }

    expect(updateConfigMock).toHaveBeenCalledTimes(1);
    const updateConfigArg = (updateConfigMock.mock.calls[0] as any)[0];
    expect(updateConfigArg.markdown.rehypePlugins.length).toBe(1);

    expect(injectScriptMock).toHaveBeenCalledTimes(1);
    const [injectType, injectContent] = (injectScriptMock.mock.calls[0] as any);
    expect(injectType).toBe('page');
    expect(injectContent).toContain("astro-rehype-nano-code/client");
  });
});

describe('CodeNanoExplainer Web Component', () => {
  it('is a valid custom element class with observed attributes', () => {
    expect(typeof CodeNanoExplainer).toBe('function');
    expect(CodeNanoExplainer.observedAttributes).toContain('data-lang');
    expect(CodeNanoExplainer.observedAttributes).toContain('data-button-text');
    expect(CodeNanoExplainer.observedAttributes).toContain('data-button-position');
  });
});
