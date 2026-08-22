// node_modules/unist-util-is/lib/index.js
var convert = function(test) {
  if (test === null || test === undefined) {
    return ok;
  }
  if (typeof test === "function") {
    return castFactory(test);
  }
  if (typeof test === "object") {
    return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
  }
  if (typeof test === "string") {
    return typeFactory(test);
  }
  throw new Error("Expected function, string, or object as test");
};
function anyFactory(tests) {
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);
  function any(...parameters) {
    let index2 = -1;
    while (++index2 < checks.length) {
      if (checks[index2].apply(this, parameters))
        return true;
    }
    return false;
  }
}
function propertiesFactory(check) {
  const checkAsRecord = check;
  return castFactory(all);
  function all(node) {
    const nodeAsRecord = node;
    let key;
    for (key in check) {
      if (nodeAsRecord[key] !== checkAsRecord[key])
        return false;
    }
    return true;
  }
}
function typeFactory(check) {
  return castFactory(type);
  function type(node) {
    return node && node.type === check;
  }
}
function castFactory(testFunction) {
  return check;
  function check(value, index, parent) {
    return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : undefined, parent || undefined));
  }
}
function ok() {
  return true;
}
function looksLikeANode(value) {
  return value !== null && typeof value === "object" && "type" in value;
}
// node_modules/unist-util-visit-parents/lib/color.js
function color(d) {
  return d;
}

// node_modules/unist-util-visit-parents/lib/index.js
var empty = [];
var CONTINUE = true;
var EXIT = false;
var SKIP = "skip";
function visitParents(tree, test, visitor, reverse) {
  let check;
  if (typeof test === "function" && typeof visitor !== "function") {
    reverse = visitor;
    visitor = test;
  } else {
    check = test;
  }
  const is2 = convert(check);
  const step = reverse ? -1 : 1;
  factory(tree, undefined, [])();
  function factory(node, index, parents) {
    const value = node && typeof node === "object" ? node : {};
    if (typeof value.type === "string") {
      const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : undefined;
      Object.defineProperty(visit, "name", {
        value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")"
      });
    }
    return visit;
    function visit() {
      let result = empty;
      let subresult;
      let offset;
      let grandparents;
      if (!test || is2(node, index, parents[parents.length - 1] || undefined)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }
      if ("children" in node && node.children) {
        const nodeAsParent = node;
        if (nodeAsParent.children && result[0] !== SKIP) {
          offset = (reverse ? nodeAsParent.children.length : -1) + step;
          grandparents = parents.concat(nodeAsParent);
          while (offset > -1 && offset < nodeAsParent.children.length) {
            const child = nodeAsParent.children[offset];
            subresult = factory(child, offset, grandparents)();
            if (subresult[0] === EXIT) {
              return subresult;
            }
            offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
          }
        }
      }
      return result;
    }
  }
}
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") {
    return [CONTINUE, value];
  }
  return value === null || value === undefined ? empty : [value];
}
// node_modules/unist-util-visit/lib/index.js
function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
  let reverse;
  let test;
  let visitor;
  if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
    test = undefined;
    visitor = testOrVisitor;
    reverse = visitorOrReverse;
  } else {
    test = testOrVisitor;
    visitor = visitorOrReverse;
    reverse = maybeReverse;
  }
  visitParents(tree, test, overload, reverse);
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    const index = parent ? parent.children.indexOf(node) : undefined;
    return visitor(node, index, parent);
  }
}
// src/rehype-plugin.ts
var DEFAULT_EXCLUDE_LANGUAGES = [
  "text",
  "plaintext",
  "txt",
  "console",
  "terminal",
  "sh",
  "shell",
  "bash",
  "zsh"
];
function extractRawText(node) {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(extractRawText).join("");
  }
  return "";
}
function extractLanguage(codeNode, preNode) {
  const classes = [];
  if (codeNode?.properties?.className) {
    if (Array.isArray(codeNode.properties.className)) {
      classes.push(...codeNode.properties.className.map(String));
    } else if (typeof codeNode.properties.className === "string") {
      classes.push(...codeNode.properties.className.split(/\s+/));
    }
  }
  if (preNode?.properties?.className) {
    if (Array.isArray(preNode.properties.className)) {
      classes.push(...preNode.properties.className.map(String));
    } else if (typeof preNode.properties.className === "string") {
      classes.push(...preNode.properties.className.split(/\s+/));
    }
  }
  if (codeNode?.properties?.["data-language"]) {
    return String(codeNode.properties["data-language"]).toLowerCase();
  }
  if (preNode?.properties?.["data-language"]) {
    return String(preNode.properties["data-language"]).toLowerCase();
  }
  for (const cls of classes) {
    if (cls.startsWith("language-")) {
      return cls.replace(/^language-/, "").toLowerCase();
    }
    if (cls.startsWith("lang-")) {
      return cls.replace(/^lang-/, "").toLowerCase();
    }
  }
  return "";
}
function rehypeNanoCodePlugin(options = {}) {
  const {
    buttonText = "Explain with AI",
    buttonPosition = "top-right",
    languages,
    excludeLanguages = DEFAULT_EXCLUDE_LANGUAGES,
    minLines = 1,
    systemPrompt,
    temperature = 0.2,
    wrapMode = "wrap",
    copyExplanation = true,
    drawerTheme = "auto"
  } = options;
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre")
        return;
      if (!parent || index === undefined || !Array.isArray(parent.children))
        return;
      if (parent.tagName === "code-nano-explainer")
        return;
      const codeNode = (node.children || []).find((child) => child.type === "element" && child.tagName === "code");
      const rawCode = extractRawText(codeNode || node);
      if (!rawCode.trim())
        return;
      const lineCount = rawCode.split(`
`).length;
      if (lineCount < minLines)
        return;
      const lang = extractLanguage(codeNode, node);
      if (languages && languages.length > 0) {
        if (!lang || !languages.includes(lang.toLowerCase())) {
          return;
        }
      }
      if (excludeLanguages && excludeLanguages.length > 0) {
        if (lang && excludeLanguages.includes(lang.toLowerCase())) {
          return;
        }
      }
      const attributes = {
        "data-nano-explainer": "true",
        "data-lang": lang || "code",
        "data-code-raw": rawCode,
        "data-button-text": buttonText,
        "data-button-position": buttonPosition,
        "data-theme": drawerTheme,
        "data-copy": copyExplanation ? "true" : "false"
      };
      if (systemPrompt) {
        attributes["data-system-prompt"] = systemPrompt;
      }
      if (temperature !== undefined) {
        attributes["data-temperature"] = String(temperature);
      }
      if (wrapMode === "attribute") {
        node.properties = {
          ...node.properties || {},
          ...attributes
        };
      } else {
        const wrapperNode = {
          type: "element",
          tagName: "code-nano-explainer",
          properties: attributes,
          children: [node]
        };
        node.properties = {
          ...node.properties || {},
          "data-nano-code-block": "true",
          "data-lang": lang || "code"
        };
        parent.children[index] = wrapperNode;
      }
    });
  };
}
var rehype_plugin_default = rehypeNanoCodePlugin;

// src/index.ts
function rehypeNanoCode(options = {}) {
  return {
    name: "astro-rehype-nano-code",
    hooks: {
      "astro:config:setup": ({ updateConfig, injectScript }) => {
        updateConfig({
          markdown: {
            rehypePlugins: [[rehypeNanoCodePlugin, options]]
          }
        });
        injectScript("page", `import 'astro-rehype-nano-code/client';`);
      }
    }
  };
}
var src_default = rehypeNanoCode;
export {
  rehypeNanoCodePlugin,
  rehypeNanoCode,
  extractRawText,
  extractLanguage,
  src_default as default
};
