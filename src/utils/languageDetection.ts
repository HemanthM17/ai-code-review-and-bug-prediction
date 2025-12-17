// Language detection utility based on code patterns

interface LanguagePattern {
  language: string;
  patterns: RegExp[];
  keywords: string[];
  strongIndicators: RegExp[]; // Very strong indicators that almost guarantee the language
  weight: number;
}

const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    language: "python",
    strongIndicators: [
      /^import\s+(pandas|numpy|sklearn|tensorflow|keras|torch|matplotlib|seaborn|flask|django|requests)\b/m,
      /^from\s+(pandas|numpy|sklearn|tensorflow|keras|torch|matplotlib|seaborn|flask|django)\s+import/m,
      /import\s+\w+\s+as\s+\w+/,
      /^def\s+\w+\s*\([^)]*\)\s*:/m,
      /^class\s+\w+(\s*\([^)]*\))?\s*:/m,
      /^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m,
      /\.py$/,
      /print\s*\([^)]*\)/,
      /^\s*elif\s+/m,
      /^\s*except\s+\w+.*:/m,
    ],
    patterns: [
      /^def\s+\w+\s*\(/m,
      /^class\s+\w+.*:/m,
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /:\s*$/m,
      /^\s*elif\s+/m,
      /self\./,
      /__init__/,
      /^\s*#[^!].*$/m,
      /\.append\s*\(/,
      /\.items\s*\(\)/,
      /\.keys\s*\(\)/,
      /\.values\s*\(\)/,
      /range\s*\(/,
      /len\s*\(/,
      /str\s*\(/,
      /int\s*\(/,
      /float\s*\(/,
      /list\s*\(/,
      /dict\s*\(/,
      /True|False|None/,
      /lambda\s+\w+\s*:/,
      /@\w+/,
      /\[\s*\w+\s+for\s+\w+\s+in\s+/,
    ],
    keywords: ["def", "elif", "except", "finally", "lambda", "yield", "async", "await", "None", "True", "False", "self", "import", "from", "as", "with", "pass", "raise", "try", "global", "nonlocal", "assert", "del"],
    weight: 1.5,
  },
  {
    language: "java",
    strongIndicators: [
      /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/,
      /import\s+java\.\w+/,
      /import\s+javax\.\w+/,
      /package\s+[\w.]+;/,
      /System\.out\.print(ln)?\s*\(/,
      /public\s+class\s+\w+\s*(extends|implements)/,
    ],
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+\w+\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.println/,
      /@Override/,
      /extends\s+\w+/,
      /implements\s+\w+/,
      /new\s+\w+\s*\(/,
      /;\s*$/m,
      /\{\s*$/m,
    ],
    keywords: ["public", "private", "protected", "class", "interface", "extends", "implements", "static", "final", "void", "throws", "synchronized", "abstract", "native"],
    weight: 1.2,
  },
  {
    language: "javascript",
    strongIndicators: [
      /const\s+\w+\s*=\s*require\s*\(/,
      /module\.exports\s*=/,
      /console\.log\s*\(/,
      /document\.(getElementById|querySelector|createElement)/,
      /window\.(addEventListener|location|localStorage)/,
      /export\s+default\s+/,
      /import\s+.*\s+from\s+['"][^'"]+['"]/,
    ],
    patterns: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*\{/,
      /=>\s*[^{]/,
      /console\.\w+\(/,
      /document\.\w+/,
      /window\.\w+/,
      /require\s*\(/,
      /\.then\s*\(/,
      /\.catch\s*\(/,
      /async\s+function/,
      /await\s+/,
    ],
    keywords: ["const", "let", "var", "function", "return", "async", "await", "class", "extends", "import", "export", "default", "null", "undefined", "typeof", "instanceof"],
    weight: 1,
  },
  {
    language: "typescript",
    strongIndicators: [
      /:\s*(string|number|boolean|void|never|unknown|any)\s*[;=)]/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=\s*\{/,
      /:\s*\w+<\w+>/,
      /<\w+>\s*\(/,
      /as\s+(string|number|boolean|any|unknown)/,
      /import\s+type\s+/,
      /export\s+interface\s+/,
      /export\s+type\s+/,
    ],
    patterns: [
      /:\s*(string|number|boolean|any|void|never)\b/,
      /interface\s+\w+\s*\{/,
      /type\s+\w+\s*=/,
      /<\w+(\s*,\s*\w+)*>/,
      /:\s*\w+\[\]/,
      /import\s+.*\s+from\s+['"].*['"]/,
      /readonly\s+\w+/,
      /\?\s*:/,
      /private\s+\w+:/,
      /public\s+\w+:/,
    ],
    keywords: ["interface", "type", "enum", "namespace", "declare", "readonly", "keyof", "typeof", "infer", "extends", "implements", "abstract", "as", "is"],
    weight: 1.4,
  },
  {
    language: "cpp",
    strongIndicators: [
      /#include\s*<iostream>/,
      /#include\s*<vector>/,
      /#include\s*<string>/,
      /std::cout\s*<</,
      /std::cin\s*>>/,
      /std::string/,
      /std::vector/,
      /using\s+namespace\s+std/,
      /int\s+main\s*\(\s*(int\s+argc|void)?\s*[,)]/,
    ],
    patterns: [
      /#include\s*<[\w.]+>/,
      /#include\s*"[\w.]+"/,
      /std::\w+/,
      /cout\s*<</,
      /cin\s*>>/,
      /nullptr/,
      /template\s*</,
      /::\w+/,
      /class\s+\w+\s*\{/,
      /public:/,
      /private:/,
      /protected:/,
    ],
    keywords: ["namespace", "template", "typename", "virtual", "override", "nullptr", "constexpr", "auto", "decltype", "static_cast", "dynamic_cast", "const_cast", "reinterpret_cast"],
    weight: 1.3,
  },
  {
    language: "c",
    strongIndicators: [
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /#include\s*<string\.h>/,
      /#include\s*<math\.h>/,
      /printf\s*\(\s*"/,
      /scanf\s*\(\s*"/,
      /int\s+main\s*\(\s*(void)?\s*\)/,
    ],
    patterns: [
      /printf\s*\(/,
      /scanf\s*\(/,
      /malloc\s*\(/,
      /free\s*\(/,
      /struct\s+\w+\s*\{/,
      /typedef\s+/,
      /sizeof\s*\(/,
      /#define\s+\w+/,
      /NULL\b/,
    ],
    keywords: ["printf", "scanf", "malloc", "free", "sizeof", "typedef", "struct", "union", "enum", "extern", "register", "volatile", "NULL"],
    weight: 1.1,
  },
  {
    language: "csharp",
    strongIndicators: [
      /using\s+System(\.\w+)*;/,
      /namespace\s+\w+(\.\w+)*\s*\{/,
      /Console\.WriteLine\s*\(/,
      /Console\.ReadLine\s*\(/,
      /public\s+class\s+\w+\s*:\s*\w+/,
      /\[[\w]+(\([^\)]*\))?\]/,
      /get\s*;\s*set\s*;/,
    ],
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /Console\.WriteLine/,
      /async\s+Task/,
      /var\s+\w+\s*=/,
      /=>.*?;/,
      /public\s+override/,
      /\?\?/,
      /\?\./, 
    ],
    keywords: ["namespace", "using", "partial", "sealed", "abstract", "virtual", "override", "async", "await", "var", "dynamic", "object", "string", "decimal", "internal"],
    weight: 1.3,
  },
  {
    language: "go",
    strongIndicators: [
      /^package\s+(main|\w+)\s*$/m,
      /func\s+main\s*\(\s*\)\s*\{/,
      /fmt\.(Println|Printf|Print)\s*\(/,
      /import\s+\(\s*$/m,
      /:=\s*\w+/,
    ],
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
    weight: 1.4,
  },
  {
    language: "rust",
    strongIndicators: [
      /fn\s+main\s*\(\s*\)\s*(->\s*\w+)?\s*\{/,
      /println!\s*\(/,
      /let\s+mut\s+\w+/,
      /impl\s+\w+\s+for\s+\w+/,
      /use\s+std::\w+/,
      /Option<\w+>/,
      /Result<\w+,\s*\w+>/,
    ],
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+mut\s+/,
      /impl\s+\w+/,
      /pub\s+(fn|struct|enum)/,
      /use\s+[\w:]+/,
      /&mut\s+/,
      /match\s+\w+\s*\{/,
      /Some\s*\(/,
      /None\b/,
      /Ok\s*\(/,
      /Err\s*\(/,
    ],
    keywords: ["fn", "let", "mut", "impl", "trait", "struct", "enum", "pub", "mod", "use", "crate", "self", "super", "where", "async", "await", "unsafe", "dyn", "move"],
    weight: 1.5,
  },
  {
    language: "php",
    strongIndicators: [
      /<\?php/,
      /\$_GET\[/,
      /\$_POST\[/,
      /\$_SESSION\[/,
      /\$this->\w+/,
      /echo\s+\$/,
      /namespace\s+[\w\\]+;/,
    ],
    patterns: [
      /\$\w+\s*=/,
      /function\s+\w+\s*\(/,
      /echo\s+/,
      /public\s+function/,
      /use\s+[\w\\]+/,
      /->[\w]+\(/,
      /array\s*\(/,
      /\[\s*['"]?\w+['"]?\s*=>/,
    ],
    keywords: ["echo", "print", "isset", "unset", "empty", "die", "exit", "include", "require", "namespace", "use", "trait", "abstract", "final"],
    weight: 1.4,
  },
  {
    language: "ruby",
    strongIndicators: [
      /^require\s+['"][\w\/]+['"]/m,
      /^require_relative\s+['"][\w\/]+['"]/m,
      /\.each\s+do\s*\|/,
      /attr_accessor\s+:/,
      /attr_reader\s+:/,
      /def\s+initialize/,
      /puts\s+['"]/,
    ],
    patterns: [
      /def\s+\w+/,
      /end$/m,
      /puts\s+/,
      /class\s+\w+\s*</,
      /require\s+['"].*['"]/,
      /\|[\w,\s]+\|/,
      /\.each\s+do/,
      /@\w+/,
      /do\s*$/m,
      /\.map\s*\{/,
      /\.select\s*\{/,
    ],
    keywords: ["def", "end", "class", "module", "attr_accessor", "attr_reader", "attr_writer", "puts", "gets", "require", "include", "extend", "yield", "lambda", "proc", "nil"],
    weight: 1.3,
  },
  {
    language: "swift",
    strongIndicators: [
      /import\s+(Foundation|UIKit|SwiftUI|Combine)/,
      /func\s+\w+\s*\([^)]*\)\s*->\s*\w+/,
      /guard\s+let\s+\w+\s*=/,
      /if\s+let\s+\w+\s*=/,
      /var\s+\w+\s*:\s*\w+\s*\?/,
      /@IBOutlet/,
      /@IBAction/,
      /override\s+func/,
    ],
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
    keywords: ["func", "var", "let", "guard", "defer", "import", "class", "struct", "enum", "protocol", "extension", "typealias", "associatedtype", "inout", "mutating", "fileprivate", "internal", "open"],
    weight: 1.2,
  },
  {
    language: "kotlin",
    strongIndicators: [
      /fun\s+main\s*\(\s*(args\s*:\s*Array<String>)?\s*\)/,
      /println\s*\(/,
      /data\s+class\s+\w+/,
      /val\s+\w+\s*:\s*\w+\s*=/,
      /var\s+\w+\s*:\s*\w+\s*=/,
      /companion\s+object/,
    ],
    patterns: [
      /fun\s+\w+\s*\(/,
      /val\s+\w+\s*[=:]/,
      /var\s+\w+\s*[=:]/,
      /class\s+\w+\s*\(/,
      /when\s*\(/,
      /object\s+\w+/,
      /\?\./,
      /!!/,
      /it\./,
    ],
    keywords: ["fun", "val", "var", "when", "data", "object", "companion", "sealed", "inline", "reified", "suspend", "coroutine", "lateinit", "by", "lazy", "init"],
    weight: 1.3,
  },
  {
    language: "html",
    strongIndicators: [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>][\s\S]*<\/head>/i,
      /<body[\s>][\s\S]*<\/body>/i,
      /<script[\s>]/i,
      /<style[\s>]/i,
    ],
    patterns: [
      /<div[\s>]/i,
      /<span[\s>]/i,
      /<p[\s>]/i,
      /<a\s+href/i,
      /<img\s+src/i,
      /<\/\w+>/,
      /<form[\s>]/i,
      /<input[\s>]/i,
      /<button[\s>]/i,
    ],
    keywords: ["DOCTYPE", "html", "head", "body", "div", "span", "script", "style", "link", "meta", "title", "form", "input", "button"],
    weight: 1.6,
  },
  {
    language: "css",
    strongIndicators: [
      /^[\w.#-]+\s*\{[\s\S]*?\}/m,
      /@media\s+(screen|print|all)/,
      /@keyframes\s+\w+/,
      /@import\s+url\(/,
      /:\s*(flex|grid|block|inline|none)\s*;/,
    ],
    patterns: [
      /[a-z-]+\s*:\s*[^;]+;/,
      /@media\s+/,
      /@import\s+/,
      /\.[\w-]+\s*\{/,
      /#[\w-]+\s*\{/,
      /:hover/,
      /:focus/,
      /!important/,
      /px|em|rem|%|vh|vw/,
    ],
    keywords: ["display", "margin", "padding", "border", "background", "color", "font", "flex", "grid", "position", "width", "height", "animation", "transition"],
    weight: 1.5,
  },
  {
    language: "sql",
    strongIndicators: [
      /SELECT\s+[\w*,\s]+\s+FROM\s+\w+/i,
      /INSERT\s+INTO\s+\w+\s*\(/i,
      /UPDATE\s+\w+\s+SET\s+\w+/i,
      /CREATE\s+TABLE\s+\w+\s*\(/i,
      /ALTER\s+TABLE\s+\w+/i,
      /DROP\s+TABLE\s+(IF\s+EXISTS\s+)?\w+/i,
    ],
    patterns: [
      /DELETE\s+FROM\s+\w+/i,
      /WHERE\s+\w+\s*=/i,
      /JOIN\s+\w+\s+ON/i,
      /GROUP\s+BY/i,
      /ORDER\s+BY/i,
      /INNER\s+JOIN/i,
      /LEFT\s+JOIN/i,
      /RIGHT\s+JOIN/i,
    ],
    keywords: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "GROUP", "ORDER", "BY", "HAVING", "UNION", "INDEX", "PRIMARY", "FOREIGN", "KEY"],
    weight: 1.6,
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

    // Check strong indicators (high weight)
    for (const pattern of langPattern.strongIndicators) {
      const matches = code.match(new RegExp(pattern, 'g'));
      if (matches) {
        score += matches.length * 15; // Strong indicators worth much more
      }
    }

    // Check regular patterns
    for (const pattern of langPattern.patterns) {
      const matches = code.match(new RegExp(pattern, 'g'));
      if (matches) {
        score += matches.length * 3;
      }
    }

    // Check keywords
    for (const keyword of langPattern.keywords) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = code.match(keywordRegex);
      if (matches) {
        score += matches.length * 1.5;
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
    // Calculate how dominant the top score is
    const dominance = secondScore > 0 ? (topScore - secondScore) / topScore : 1;
    confidence = Math.min(100, Math.round(dominance * 100 * 0.7 + (topScore > 50 ? 30 : topScore * 0.6)));
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
