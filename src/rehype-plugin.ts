import { visit } from 'unist-util-visit';
import type { RehypeNanoCodeOptions } from './types.js';

export interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, any>;
  children?: HastNode[];
}

const DEFAULT_EXCLUDE_LANGUAGES = [
  'text',
  'plaintext',
  'txt',
  'console',
  'terminal',
  'sh',
  'shell',
  'bash',
  'zsh'
];

/**
 * Extracts plain text from a HAST node tree.
 */
export function extractRawText(node: HastNode): string {
  if (node.type === 'text' && typeof node.value === 'string') {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(extractRawText).join('');
  }
  return '';
}

/**
 * Extracts programming language from a code/pre node.
 */
export function extractLanguage(codeNode?: HastNode, preNode?: HastNode): string {
  // Check code element class names
  const classes: string[] = [];
  if (codeNode?.properties?.className) {
    if (Array.isArray(codeNode.properties.className)) {
      classes.push(...codeNode.properties.className.map(String));
    } else if (typeof codeNode.properties.className === 'string') {
      classes.push(...codeNode.properties.className.split(/\s+/));
    }
  }

  // Check pre element class names
  if (preNode?.properties?.className) {
    if (Array.isArray(preNode.properties.className)) {
      classes.push(...preNode.properties.className.map(String));
    } else if (typeof preNode.properties.className === 'string') {
      classes.push(...preNode.properties.className.split(/\s+/));
    }
  }

  // Check data-language attributes
  if (codeNode?.properties?.['data-language']) {
    return String(codeNode.properties['data-language']).toLowerCase();
  }
  if (preNode?.properties?.['data-language']) {
    return String(preNode.properties['data-language']).toLowerCase();
  }

  for (const cls of classes) {
    if (cls.startsWith('language-')) {
      return cls.replace(/^language-/, '').toLowerCase();
    }
    if (cls.startsWith('lang-')) {
      return cls.replace(/^lang-/, '').toLowerCase();
    }
  }

  return '';
}

/**
 * Rehype plugin for nano code explanation.
 * Inspects <pre><code> blocks, extracts raw code & language, and wraps with <code-nano-explainer>.
 */
export function rehypeNanoCodePlugin(options: RehypeNanoCodeOptions = {}) {
  const {
    buttonText = 'Explain with AI',
    buttonPosition = 'top-right',
    languages,
    excludeLanguages = DEFAULT_EXCLUDE_LANGUAGES,
    minLines = 1,
    systemPrompt,
    temperature = 0.2,
    wrapMode = 'wrap',
    copyExplanation = true,
    drawerTheme = 'auto'
  } = options;

  return (tree: HastNode) => {
    visit(tree, 'element', (node: HastNode, index: number | undefined, parent: HastNode | undefined) => {
      if (node.tagName !== 'pre') return;
      if (!parent || index === undefined || !Array.isArray(parent.children)) return;

      // Avoid double wrapping if already inside code-nano-explainer
      if (parent.tagName === 'code-nano-explainer') return;

      // Find code element
      const codeNode = (node.children || []).find(
        (child) => child.type === 'element' && child.tagName === 'code'
      );

      const rawCode = extractRawText(codeNode || node);
      if (!rawCode.trim()) return;

      // Check minimum lines
      const lineCount = rawCode.split('\n').length;
      if (lineCount < minLines) return;

      // Extract language
      const lang = extractLanguage(codeNode, node);

      // Filter by language whitelist if specified
      if (languages && languages.length > 0) {
        if (!lang || !languages.includes(lang.toLowerCase())) {
          return;
        }
      }

      // Filter by language blacklist
      if (excludeLanguages && excludeLanguages.length > 0) {
        if (lang && excludeLanguages.includes(lang.toLowerCase())) {
          return;
        }
      }

      const attributes: Record<string, string> = {
        'data-nano-explainer': 'true',
        'data-lang': lang || 'code',
        'data-code-raw': rawCode,
        'data-button-text': buttonText,
        'data-button-position': buttonPosition,
        'data-theme': drawerTheme,
        'data-copy': copyExplanation ? 'true' : 'false'
      };

      if (systemPrompt) {
        attributes['data-system-prompt'] = systemPrompt;
      }
      if (temperature !== undefined) {
        attributes['data-temperature'] = String(temperature);
      }

      if (wrapMode === 'attribute') {
        node.properties = {
          ...(node.properties || {}),
          ...attributes
        };
      } else {
        // Wrap mode (wrap / custom-element)
        const wrapperNode: HastNode = {
          type: 'element',
          tagName: 'code-nano-explainer',
          properties: attributes,
          children: [node]
        };

        // Also add marker attributes to inner pre for styling hooks
        node.properties = {
          ...(node.properties || {}),
          'data-nano-code-block': 'true',
          'data-lang': lang || 'code'
        };

        parent.children[index] = wrapperNode;
      }
    });
  };
}

export default rehypeNanoCodePlugin;
