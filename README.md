# astro-rehype-nano-code

[![npm version](https://img.shields.io/badge/npm-v0.1.0-blue.svg)](https://npmjs.com/package/astro-rehype-nano-code)
[![Astro](https://img.shields.io/badge/Astro-5.0+-orange.svg)](https://astro.build)
[![Chrome AI](https://img.shields.io/badge/Chrome_Built--in_AI-Gemini_Nano-4285F4.svg)](https://developer.chrome.com/docs/ai/built-in)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Combined Astro integration and Rehype plugin that inspects markdown code blocks at build time and wires them for **on-demand, on-device AI explanations** using Chrome Built-in AI (Gemini Nano) with **zero initial JS bloat**.

---

## ✨ Features

- ⚡ **Zero Initial JS Bloat**: Build-time HAST transformation prepares code blocks with metadata; no heavy runtime dependencies or cloud AI SDKs loaded upfront.
- 🔒 **100% Local & Private**: Runs directly in the user's browser on Google Gemini Nano (Prompt API). No API keys, no telemetry, no cloud costs, no latency roundtrips.
- 🌊 **Streaming UI**: Step-by-step code explanation streams in real-time into an accessible, collapsible drawer attached to the code block.
- 🎯 **Fine-Grained Filtering**: Filter by programming language whitelist/blacklist or minimum line count.
- 🎨 **Fully Themeable**: Comes with sleek, blur-backdrop defaults and exposes clean CSS Custom Properties (`--nano-*`) for full customization.
- 📋 **Built-in Copy & Re-explain**: Includes one-click clipboard copying and re-prompting.
- 📢 **Custom Events**: Dispatches DOM events (`nano-explain-start`, `nano-explain-chunk`, `nano-explain-complete`, `nano-explain-error`) for telemetry or UI integrations.
- 🛡️ **Graceful Fallbacks**: Clear, helpful prompt guides if the client browser does not yet have Gemini Nano enabled.

---

## 📦 Installation

```bash
# Using bun
bun add astro-rehype-nano-code

# Using npm
npm install astro-rehype-nano-code

# Using pnpm
pnpm add astro-rehype-nano-code
```

---

## ⚙️ Chrome Built-in AI Prerequisites

`astro-rehype-nano-code` uses Chrome's experimental **Prompt API (Gemini Nano)**. To test and use local AI features:

1. Use **Google Chrome (version 128+)** or **Chrome Canary / Dev**.
2. Navigate to `chrome://flags/#prompt-api-for-gemini-nano` and set to **Enabled**.
3. Navigate to `chrome://flags/#optimization-guide-on-device-model` and set to **Enabled BypassPerfRequirement**.
4. Restart Chrome.
5. Navigate to `chrome://components` and find **Optimization Guide On Device Model**. Click **Check for update** until downloaded and ready.

---

## 🚀 Quick Start

### 1. Astro Integration Setup

Add `rehypeNanoCode` to your `astro.config.mjs`:

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { rehypeNanoCode } from 'astro-rehype-nano-code';

export default defineConfig({
  integrations: [
    rehypeNanoCode({
      buttonText: '✨ Explain Code',
      buttonPosition: 'top-right',
      excludeLanguages: ['bash', 'sh', 'text', 'console'],
      minLines: 2
    })
  ]
});
```

### 2. Write Markdown as Usual

In any `.md` or `.mdx` content file or page:

````markdown
# Welcome to My Guide

Check out this recursive Fibonacci algorithm:

```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```
````

During build time, `rehypeNanoCode` extracts the language (`typescript`) and raw source, wraps the `<pre>` in `<code-nano-explainer>`, and injects the lightweight client Web Component.

When readers click **✨ Explain Code**, Gemini Nano generates a structured, step-by-step breakdown streamed directly below the code!

---

## 🛠️ Rehype Plugin Standalone Usage

If using Rehype outside the full Astro integration (e.g. custom Unified pipelines, MDX, or content collections):

```typescript
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { rehypeNanoCodePlugin } from 'astro-rehype-nano-code/rehype';
import rehypeStringify from 'rehype-stringify';

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeNanoCodePlugin, {
    buttonText: 'Explain with AI',
    languages: ['typescript', 'javascript', 'python', 'rust']
  })
  .use(rehypeStringify);

const html = await processor.process(markdownInput);
```

Then import the client Web Component script in your layout:

```astro
---
// src/layouts/Layout.astro
import 'astro-rehype-nano-code/client';
---
<slot />
```

---

## 🎛️ Configuration Options

The `rehypeNanoCode(options?: RehypeNanoCodeOptions)` integration and `rehypeNanoCodePlugin(options?: RehypeNanoCodeOptions)` accept the following options:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `buttonText` | `string` | `'Explain with AI'` | Label displayed on the trigger button. |
| `buttonPosition` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'header'` | `'top-right'` | Position of the trigger button relative to the code block. |
| `languages` | `string[]` | `undefined` (all) | Whitelist of language IDs to enable. If specified, only listed languages receive explainer buttons. |
| `excludeLanguages` | `string[]` | `['text', 'plaintext', 'console', 'sh', 'shell', 'bash', 'zsh']` | Blacklist of language IDs to exclude. |
| `minLines` | `number` | `1` | Minimum number of lines in a code block required to attach the explainer. |
| `systemPrompt` | `string` | *Built-in educator prompt* | Custom system instruction passed to Gemini Nano session. |
| `temperature` | `number` | `0.2` | Sampling temperature for the model response (0.0 to 1.0). |
| `wrapMode` | `'wrap' \| 'attribute'` | `'wrap'` | `'wrap'` wraps `<pre>` with `<code-nano-explainer>`; `'attribute'` adds data attributes directly to `<pre>`. |
| `copyExplanation` | `boolean` | `true` | Whether to show the "Copy" explanation button in the drawer header. |
| `drawerTheme` | `'auto' \| 'dark' \| 'light'` | `'auto'` | Theme mode for the explanation drawer. |

---

## 🎨 Styling & CSS Custom Properties

The custom element is styled using CSS Custom Properties that can be customized in your global CSS:

```css
code-nano-explainer {
  /* Button appearance */
  --nano-btn-color: #f8fafc;
  --nano-btn-bg: rgba(15, 23, 42, 0.85);
  --nano-btn-border: rgba(255, 255, 255, 0.15);
  --nano-btn-hover-bg: rgba(30, 41, 59, 0.95);
  --nano-sparkle-color: #38bdf8;

  /* Drawer container */
  --nano-drawer-bg: #0f172a;
  --nano-drawer-border: #334155;
  --nano-drawer-color: #e2e8f0;
  --nano-title-color: #f8fafc;

  /* Badges & Actions */
  --nano-badge-bg: rgba(56, 189, 248, 0.15);
  --nano-badge-color: #38bdf8;
  --nano-action-color: #94a3b8;
}
```

---

## 📡 Client DOM Events

The `<code-nano-explainer>` custom element dispatches standard custom events with bubbling and composed boundaries:

```typescript
// Listen for AI explanation start
document.addEventListener('nano-explain-start', (e: CustomEvent) => {
  console.log('Started explanation for:', e.detail.lang, e.detail.code);
});

// Real-time chunk updates
document.addEventListener('nano-explain-chunk', (e: CustomEvent) => {
  console.log('Streamed chunk:', e.detail.chunk);
});

// Finished generation
document.addEventListener('nano-explain-complete', (e: CustomEvent) => {
  console.log('Full explanation ready:', e.detail.explanation);
});

// Error handling
document.addEventListener('nano-explain-error', (e: CustomEvent) => {
  console.error('Explanation error:', e.detail.error);
});
```

---

## 🧪 Testing

```bash
# Run unit & AST transformer tests
bun test

# Run type check
bun run typecheck

# Build bundle & declaration files
bun run build
```

---

## 📄 License

MIT © 2026
