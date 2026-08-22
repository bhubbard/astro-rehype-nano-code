import { describe, it, expect } from 'bun:test';
import {
  rehypeNanoCodePlugin,
  extractRawText,
  extractLanguage,
  type HastNode
} from '../src/rehype-plugin.js';

describe('extractRawText', () => {
  it('extracts text from plain text node', () => {
    const node: HastNode = { type: 'text', value: 'hello world' };
    expect(extractRawText(node)).toBe('hello world');
  });

  it('extracts nested text from syntax-highlighted token spans', () => {
    const node: HastNode = {
      type: 'element',
      tagName: 'code',
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['token', 'keyword'] },
          children: [{ type: 'text', value: 'const' }]
        },
        { type: 'text', value: ' ' },
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['token', 'variable'] },
          children: [{ type: 'text', value: 'name' }]
        },
        { type: 'text', value: ' = ' },
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['token', 'string'] },
          children: [{ type: 'text', value: '"Astro"' }]
        },
        { type: 'text', value: ';' }
      ]
    };

    expect(extractRawText(node)).toBe('const name = "Astro";');
  });
});

describe('extractLanguage', () => {
  it('extracts language from language- prefix class on code element', () => {
    const code: HastNode = {
      type: 'element',
      tagName: 'code',
      properties: { className: ['language-typescript', 'highlighted'] }
    };
    expect(extractLanguage(code)).toBe('typescript');
  });

  it('extracts language from lang- prefix class on pre element', () => {
    const pre: HastNode = {
      type: 'element',
      tagName: 'pre',
      properties: { className: 'lang-python' }
    };
    expect(extractLanguage(undefined, pre)).toBe('python');
  });

  it('extracts language from data-language attribute', () => {
    const code: HastNode = {
      type: 'element',
      tagName: 'code',
      properties: { 'data-language': 'rust' }
    };
    expect(extractLanguage(code)).toBe('rust');
  });

  it('returns empty string when no language detected', () => {
    const code: HastNode = {
      type: 'element',
      tagName: 'code',
      properties: {}
    };
    expect(extractLanguage(code)).toBe('');
  });
});

describe('rehypeNanoCodePlugin', () => {
  it('wraps <pre><code> with <code-nano-explainer> by default', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-js'] },
              children: [{ type: 'text', value: 'console.log("hello");' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin();
    plugin(tree);

    expect(tree.children?.length).toBe(1);
    const wrapper = tree.children![0];
    expect(wrapper.tagName).toBe('code-nano-explainer');
    expect(wrapper.properties?.['data-lang']).toBe('js');
    expect(wrapper.properties?.['data-code-raw']).toBe('console.log("hello");');
    expect(wrapper.properties?.['data-button-text']).toBe('Explain with AI');
    expect(wrapper.properties?.['data-button-position']).toBe('top-right');
    expect(wrapper.children?.length).toBe(1);
    expect(wrapper.children![0].tagName).toBe('pre');
  });

  it('honors language inclusion list', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-python'] },
              children: [{ type: 'text', value: 'print("py")' }]
            }
          ]
        },
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-ruby'] },
              children: [{ type: 'text', value: 'puts "ruby"' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin({ languages: ['python'] });
    plugin(tree);

    // Python should be wrapped, ruby should remain untouched <pre>
    expect(tree.children![0].tagName).toBe('code-nano-explainer');
    expect(tree.children![1].tagName).toBe('pre');
  });

  it('excludes blacklisted languages by default (e.g. bash/sh)', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-bash'] },
              children: [{ type: 'text', value: 'npm install astro' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin();
    plugin(tree);

    expect(tree.children![0].tagName).toBe('pre');
  });

  it('respects minLines constraint', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-ts'] },
              children: [{ type: 'text', value: 'const a = 1;' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin({ minLines: 3 });
    plugin(tree);

    // Only 1 line, minLines is 3 -> should NOT wrap
    expect(tree.children![0].tagName).toBe('pre');
  });

  it('supports wrapMode="attribute"', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-go'] },
              children: [{ type: 'text', value: 'package main\nfunc main() {}' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin({ wrapMode: 'attribute' });
    plugin(tree);

    expect(tree.children![0].tagName).toBe('pre');
    expect(tree.children![0].properties?.['data-nano-explainer']).toBe('true');
    expect(tree.children![0].properties?.['data-lang']).toBe('go');
    expect(tree.children![0].properties?.['data-code-raw']).toContain('package main');
  });

  it('passes custom systemPrompt and temperature to attributes', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-rust'] },
              children: [{ type: 'text', value: 'fn main() { println!("hi"); }' }]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin({
      systemPrompt: 'Explain in French.',
      temperature: 0.7,
      buttonText: 'Expliquer le code'
    });
    plugin(tree);

    const wrapper = tree.children![0];
    expect(wrapper.tagName).toBe('code-nano-explainer');
    expect(wrapper.properties?.['data-system-prompt']).toBe('Explain in French.');
    expect(wrapper.properties?.['data-temperature']).toBe('0.7');
    expect(wrapper.properties?.['data-button-text']).toBe('Expliquer le code');
  });

  it('avoids double wrapping when already wrapped', () => {
    const tree: HastNode = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'code-nano-explainer',
          properties: { 'data-lang': 'ts' },
          children: [
            {
              type: 'element',
              tagName: 'pre',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'code',
                  properties: { className: ['language-ts'] },
                  children: [{ type: 'text', value: 'const x = 1;' }]
                }
              ]
            }
          ]
        }
      ]
    };

    const plugin = rehypeNanoCodePlugin();
    plugin(tree);

    expect(tree.children!.length).toBe(1);
    expect(tree.children![0].tagName).toBe('code-nano-explainer');
    expect(tree.children![0].children![0].tagName).toBe('pre');
  });
});
