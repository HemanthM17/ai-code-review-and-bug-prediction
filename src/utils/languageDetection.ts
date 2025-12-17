// Language detection utility based on code patterns

interface LanguagePattern {
  language: string;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    language: "python",
    patterns: [
      /^def\s+\w+\s*\(/m,
      /^class\s+\w+.*:/m,
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /:\s*$/m,
      /^\s*elif\s+/m,
      /print\s*\(/,
      /self\./,
      /__init__/,
      /^\s*#.*$/m,
    ],
    keywords: ["def", "elif", "except", "finally", "lambda", "yield", "async", "await", "None", "True", "False", "self", "import", "from", "as", "with", "pass"],
    weight: 1,
  },
  {
    language: "java",
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+\w+\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.println/,
      /import\s+java\./,
      /@Override/,
      /extends\s+\w+/,
      /implements\s+\w+/,
      /new\s+\w+\s*\(/,
      /package\s+[\w.]+;/,
    ],
    keywords: ["public", "private", "protected", "class", "interface", "extends", "implements", "static", "final", "void", "throws", "synchronized"],
    weight: 1.2,
  },
  {
    language: "javascript",
    patterns: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*\{/,
      /console\.log\(/,
      /document\.\w+/,
      /window\.\w+/,
      /require\s*\(/,
      /module\.exports/,
      /export\s+(default\s+)?/,
    ],
    keywords: ["const", "let", "var", "function", "return", "async", "await", "class", "extends", "import", "export", "default", "null", "undefined"],
    weight: 1,
  },
  {
    language: "typescript",
    patterns: [
      /:\s*(string|number|boolean|any|void|never)\b/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=/,
      /<\w+(\s*,\s*\w+)*>/,
      /as\s+(string|number|boolean|any)/,
      /:\s*\w+\[\]/,
      /import\s+.*\s+from\s+['"].*['"]/,
      /export\s+(interface|type)\s+/,
      /readonly\s+\w+/,
      /\?\s*:/,
    ],
    keywords: ["interface", "type", "enum", "namespace", "declare", "readonly", "keyof", "typeof", "infer", "extends", "implements"],
    weight: 1.3,
  },
  {
    language: "cpp",
    patterns: [
      /#include\s*<[\w.]+>/,
      /#include\s*"[\w.]+"/,
      /std::\w+/,
      /cout\s*<</,
      /cin\s*>>/,
      /int\s+main\s*\(/,
      /nullptr/,
      /template\s*</,
      /::\w+/,
      /using\s+namespace/,
    ],
    keywords: ["namespace", "template", "typename", "virtual", "override", "nullptr", "constexpr", "auto", "decltype", "static_cast", "dynamic_cast"],
    weight: 1.2,
  },
  {
    language: "c",
    patterns: [
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /#include\s*<string\.h>/,
      /printf\s*\(/,
      /scanf\s*\(/,
      /malloc\s*\(/,
      /free\s*\(/,
      /int\s+main\s*\(\s*(void|int\s+argc)?\s*[,)]/,
      /struct\s+\w+\s*\{/,
      /typedef\s+/,
    ],
    keywords: ["printf", "scanf", "malloc", "free", "sizeof", "typedef", "struct", "union", "enum", "extern", "register", "volatile"],
    weight: 1.1,
  },
  {
    language: "csharp",
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /Console\.WriteLine/,
      /\[[\w]+\]/,
      /get\s*;\s*set\s*;/,
      /async\s+Task/,
      /var\s+\w+\s*=/,
      /=>.*?;/,
      /public\s+override/,
    ],
    keywords: ["namespace", "using", "partial", "sealed", "abstract", "virtual", "override", "async", "await", "var", "dynamic", "object", "string", "decimal"],
    weight: 1.2,
  },
  {
    language: "go",
    patterns: [
      /package\s+\w+/,
      /func\s+\w+\s*\(/,
      /import\s+\(/,
      /fmt\.\w+/,
      /func\s+\(\w+\s+\*?\w+\)/,
      /:=/,
      /go\s+\w+/,
      /chan\s+\w+/,
      /defer\s+/,
      /make\s*\(/,
    ],
    keywords: ["package", "import", "func", "var", "const", "type", "struct", "interface", "map", "chan", "go", "defer", "select", "range", "fallthrough"],
    weight: 1.3,
  },
  {
    language: "rust",
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+mut\s+/,
      /impl\s+\w+/,
      /pub\s+(fn|struct|enum)/,
      /use\s+[\w:]+/,
      /&mut\s+/,
      /Option<\w+>/,
      /Result<.*>/,
      /println!\s*\(/,
      /match\s+\w+\s*\{/,
    ],
    keywords: ["fn", "let", "mut", "impl", "trait", "struct", "enum", "pub", "mod", "use", "crate", "self", "super", "where", "async", "await", "unsafe", "dyn"],
    weight: 1.4,
  },
  {
    language: "php",
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /function\s+\w+\s*\(/,
      /echo\s+/,
      /\$this->/,
      /public\s+function/,
      /namespace\s+[\w\\]+/,
      /use\s+[\w\\]+/,
      /->[\w]+\(/,
      /array\s*\(/,
    ],
    keywords: ["echo", "print", "isset", "unset", "empty", "die", "exit", "include", "require", "namespace", "use", "trait", "abstract", "final"],
    weight: 1.3,
  },
  {
    language: "ruby",
    patterns: [
      /def\s+\w+/,
      /end$/m,
      /puts\s+/,
      /class\s+\w+\s*</,
      /attr_accessor/,
      /require\s+['"].*['"]/,
      /\|[\w,\s]+\|/,
      /\.each\s+do/,
      /@\w+/,
      /do\s*$/m,
    ],
    keywords: ["def", "end", "class", "module", "attr_accessor", "attr_reader", "attr_writer", "puts", "gets", "require", "include", "extend", "yield", "lambda", "proc"],
    weight: 1.2,
  },
  {
    language: "swift",
    patterns: [
      /func\s+\w+\s*\(/,
      /var\s+\w+\s*:/,
      /let\s+\w+\s*:/,
      /guard\s+let/,
      /if\s+let/,
      /import\s+\w+/,
      /class\s+\w+\s*:/,
      /struct\s+\w+\s*\{/,
      /enum\s+\w+\s*\{/,
      /print\s*\(/,
    ],
    keywords: ["func", "var", "let", "guard", "defer", "import", "class", "struct", "enum", "protocol", "extension", "typealias", "associatedtype", "inout", "mutating"],
    weight: 1.3,
  },
  {
    language: "kotlin",
    patterns: [
      /fun\s+\w+\s*\(/,
      /val\s+\w+\s*[=:]/,
      /var\s+\w+\s*[=:]/,
      /class\s+\w+\s*\(/,
      /data\s+class/,
      /println\s*\(/,
      /when\s*\(/,
      /object\s+\w+/,
      /companion\s+object/,
      /\?\./,
    ],
    keywords: ["fun", "val", "var", "when", "data", "object", "companion", "sealed", "inline", "reified", "suspend", "coroutine", "lateinit", "by", "lazy"],
    weight: 1.3,
  },
  {
    language: "html",
    patterns: [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<div[\s>]/i,
      /<span[\s>]/i,
      /<p[\s>]/i,
      /<a\s+href/i,
      /<img\s+src/i,
      /<\/\w+>/,
    ],
    keywords: ["DOCTYPE", "html", "head", "body", "div", "span", "script", "style", "link", "meta", "title", "form", "input", "button"],
    weight: 1.5,
  },
  {
    language: "css",
    patterns: [
      /[\w.#-]+\s*\{[\s\S]*?\}/,
      /[a-z-]+\s*:\s*[^;]+;/,
      /@media\s+/,
      /@import\s+/,
      /@keyframes\s+/,
      /\.[\w-]+\s*\{/,
      /#[\w-]+\s*\{/,
      /:\s*hover/,
      /:\s*focus/,
      /!important/,
    ],
    keywords: ["display", "margin", "padding", "border", "background", "color", "font", "flex", "grid", "position", "width", "height", "animation", "transition"],
    weight: 1.4,
  },
  {
    language: "sql",
    patterns: [
      /SELECT\s+[\w*,\s]+\s+FROM/i,
      /INSERT\s+INTO\s+\w+/i,
      /UPDATE\s+\w+\s+SET/i,
      /DELETE\s+FROM\s+\w+/i,
      /CREATE\s+TABLE\s+\w+/i,
      /ALTER\s+TABLE\s+\w+/i,
      /DROP\s+TABLE\s+\w+/i,
      /WHERE\s+\w+\s*=/i,
      /JOIN\s+\w+\s+ON/i,
      /GROUP\s+BY/i,
    ],
    keywords: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "GROUP", "ORDER", "BY", "HAVING", "UNION"],
    weight: 1.5,
  },
];

export interface DetectionResult {
  detectedLanguage: string;
  confidence: number;
  scores: { language: string; score: number }[];
}

export function detectLanguageFromCode(code: string): DetectionResult {
  if (!code || code.trim().length === 0) {
    return { detectedLanguage: "javascript", confidence: 0, scores: [] };
  }

  const scores: { language: string; score: number }[] = [];

  for (const langPattern of LANGUAGE_PATTERNS) {
    let score = 0;

    // Check regex patterns
    for (const pattern of langPattern.patterns) {
      const matches = code.match(new RegExp(pattern, 'g'));
      if (matches) {
        score += matches.length * 2;
      }
    }

    // Check keywords
    for (const keyword of langPattern.keywords) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = code.match(keywordRegex);
      if (matches) {
        score += matches.length;
      }
    }

    // Apply weight
    score *= langPattern.weight;

    scores.push({ language: langPattern.language, score });
  }

  // Sort by score
  scores.sort((a, b) => b.score - a.score);

  const topScore = scores[0]?.score || 0;
  const secondScore = scores[1]?.score || 0;

  // Calculate confidence
  let confidence = 0;
  if (topScore > 0) {
    if (secondScore === 0) {
      confidence = 100;
    } else {
      confidence = Math.min(100, Math.round(((topScore - secondScore) / topScore) * 100 + 50));
    }
  }

  return {
    detectedLanguage: scores[0]?.language || "javascript",
    confidence,
    scores: scores.slice(0, 5),
  };
}

export function getLanguageLabel(value: string): string {
  const labels: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    csharp: "C#",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    swift: "Swift",
    kotlin: "Kotlin",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
  };
  return labels[value] || value;
}
