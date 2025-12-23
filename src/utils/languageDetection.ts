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
      // Python-specific imports (unique to Python)
      /^import\s+(pandas|numpy|sklearn|tensorflow|keras|torch|matplotlib|seaborn|flask|django|requests|os|sys|re|json|csv|datetime|collections|itertools|functools|typing|asyncio|pathlib)\b/m,
      /^from\s+(pandas|numpy|sklearn|tensorflow|keras|torch|matplotlib|seaborn|flask|django|fastapi|typing|collections|itertools|functools|asyncio|pathlib|dataclasses)\s+import/m,
      // Python function definition with colon (UNIQUE - no other language uses this syntax)
      /^def\s+\w+\s*\([^)]*\)\s*:\s*$/m,
      /^\s+def\s+\w+\s*\([^)]*\)\s*:\s*$/m,
      // Python class definition with colon
      /^class\s+\w+(\s*\([^)]*\))?\s*:\s*$/m,
      // Python-specific syntax
      /^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m,
      /^\s*elif\s+[^{]+:\s*$/m,
      /^\s*except\s+\w+(\s+as\s+\w+)?\s*:\s*$/m,
      /^\s*try\s*:\s*$/m,
      /^\s*finally\s*:\s*$/m,
      /^\s*with\s+.+\s+as\s+\w+\s*:\s*$/m,
      // Python print function
      /print\s*\([^)]*\)/,
      // Python list comprehension (UNIQUE)
      /\[\s*\w+(\.\w+)*\s+for\s+\w+\s+in\s+/,
      // Python dict comprehension
      /\{\s*\w+\s*:\s*\w+\s+for\s+\w+\s+in\s+/,
      // Python decorators
      /^@\w+(\.\w+)*(\([^)]*\))?\s*$/m,
      // Python f-strings
      /f["'][^"']*\{[^}]+\}[^"']*["']/,
      // Python triple quotes
      /["']{3}[\s\S]*?["']{3}/,
    ],
    patterns: [
      /^import\s+\w+$/m,
      /^from\s+\w+\s+import\s+/m,
      /self\.\w+/,
      /__init__/,
      /__str__/,
      /__repr__/,
      /^\s*#[^!].*$/m,
      /\.append\s*\(/,
      /\.extend\s*\(/,
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
      /set\s*\(/,
      /tuple\s*\(/,
      /\bTrue\b/,
      /\bFalse\b/,
      /\bNone\b/,
      /lambda\s+\w+\s*:/,
      /\bimport\s+\w+\s+as\s+\w+\b/,
      /\bor\b/,
      /\band\b/,
      /\bnot\b/,
      /\bin\b/,
      /\bis\b/,
    ],
    keywords: ["def", "elif", "except", "finally", "lambda", "yield", "async", "await", "None", "True", "False", "self", "import", "from", "as", "with", "pass", "raise", "try", "global", "nonlocal", "assert", "del", "in", "is", "not", "and", "or"],
    weight: 2.0,
  },
  {
    language: "java",
    strongIndicators: [
      // Java main method (UNIQUE)
      /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*\]\s*\w+\s*\)/,
      // Java package imports (UNIQUE)
      /^import\s+java\.[\w.]+;$/m,
      /^import\s+javax\.[\w.]+;$/m,
      /^import\s+org\.(springframework|apache|junit)\.[\w.]+;$/m,
      // Java package declaration
      /^package\s+[\w.]+;$/m,
      // Java System.out (UNIQUE)
      /System\.out\.print(ln)?\s*\(/,
      /System\.err\.print(ln)?\s*\(/,
      // Java class extends/implements
      /public\s+(final\s+)?class\s+\w+\s+(extends\s+\w+\s+)?(implements\s+[\w,\s]+\s*)?\{/,
      // Java annotations
      /@Override\s*$/m,
      /@Autowired/,
      /@Component/,
      /@Service/,
      /@Repository/,
    ],
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+\w+\s+\w+\s*;/,
      /protected\s+\w+\s+\w+/,
      /@\w+(\([^)]*\))?/,
      /new\s+\w+\s*\(/,
      /\.equals\s*\(/,
      /\.hashCode\s*\(/,
      /\.toString\s*\(/,
      /throws\s+\w+/,
      /catch\s*\(\w+\s+\w+\)/,
    ],
    keywords: ["public", "private", "protected", "class", "interface", "extends", "implements", "static", "final", "void", "throws", "synchronized", "abstract", "native", "transient", "volatile"],
    weight: 1.5,
  },
  {
    language: "javascript",
    strongIndicators: [
      // CommonJS (UNIQUE to Node.js/JavaScript)
      /const\s+\w+\s*=\s*require\s*\(\s*['"][^'"]+['"]\s*\)/,
      /module\.exports\s*=/,
      /exports\.\w+\s*=/,
      // Console (mostly JS/TS)
      /console\.(log|error|warn|info|debug)\s*\(/,
      // DOM APIs (UNIQUE to JavaScript in browser)
      /document\.(getElementById|querySelector|querySelectorAll|createElement|getElementsByClassName)\s*\(/,
      /window\.(addEventListener|removeEventListener|location|localStorage|sessionStorage)\b/,
      // ES6 imports without types
      /^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\s*$/m,
      /^import\s+\w+\s+from\s+['"][^'"]+['"];?\s*$/m,
      /^export\s+default\s+/m,
      /^export\s+(const|let|var|function|class)\s+/m,
      // Arrow functions
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>/,
      /=>\s*\{/,
      // Promises
      /\.then\s*\(\s*(async\s*)?\(/,
      /\.catch\s*\(\s*\(/,
      /Promise\.(all|race|resolve|reject)\s*\(/,
      // async/await in JS style
      /async\s+(function|\(|\w+\s*=>)/,
    ],
    patterns: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*[^{]/,
      /\.\.\.\w+/,
      /`[^`]*\$\{[^}]+\}[^`]*`/,
      /JSON\.(parse|stringify)\s*\(/,
      /Array\.(isArray|from|of)\s*\(/,
      /Object\.(keys|values|entries|assign)\s*\(/,
    ],
    keywords: ["const", "let", "var", "function", "return", "async", "await", "class", "extends", "import", "export", "default", "null", "undefined", "typeof", "instanceof", "new", "this", "super"],
    weight: 1.0,
  },
  {
    language: "typescript",
    strongIndicators: [
      // Type annotations (UNIQUE to TypeScript)
      /:\s*(string|number|boolean|void|never|unknown|any|null|undefined)\s*[;=),\]]/,
      /:\s*(string|number|boolean|void|never|unknown|any)\[\]\s*[;=),]/,
      // Interface declaration (UNIQUE)
      /^interface\s+\w+\s*(<[\w,\s<>]+>)?\s*(\s+extends\s+[\w,\s<>]+)?\s*\{/m,
      /^export\s+interface\s+\w+/m,
      // Type declaration (UNIQUE)
      /^type\s+\w+\s*(<[\w,\s<>]+>)?\s*=\s*/m,
      /^export\s+type\s+\w+/m,
      // Generic types (TypeScript-style)
      /:\s*\w+<[\w,\s<>\[\]|&]+>/,
      /<\w+(\s*,\s*\w+)*>\s*\(/,
      // Type assertions
      /as\s+(string|number|boolean|any|unknown|const)\b/,
      /<(string|number|boolean|any)>/,
      // Import type
      /import\s+type\s+/,
      // Readonly, optional
      /readonly\s+\w+\s*:/,
      /\?\s*:\s*\w+/,
      // Access modifiers with types
      /private\s+readonly\s+\w+\s*:/,
      /public\s+\w+\s*:\s*\w+/,
    ],
    patterns: [
      /enum\s+\w+\s*\{/,
      /namespace\s+\w+\s*\{/,
      /declare\s+(const|let|var|function|class|module)/,
      /keyof\s+\w+/,
      /typeof\s+\w+/,
      /\w+\s+extends\s+\w+\s*\?/,
      /\w+\s+\|\s+\w+/,
      /\w+\s+&\s+\w+/,
      /Partial<\w+>/,
      /Required<\w+>/,
      /Pick<\w+,\s*['"][^'"]+['"]>/,
      /Omit<\w+,\s*['"][^'"]+['"]>/,
      /Record<\w+,\s*\w+>/,
    ],
    keywords: ["interface", "type", "enum", "namespace", "declare", "readonly", "keyof", "typeof", "infer", "extends", "implements", "abstract", "as", "is", "never", "unknown", "any"],
    weight: 1.8,
  },
  {
    language: "cpp",
    strongIndicators: [
      // C++ standard library headers (UNIQUE)
      /#include\s*<iostream>/,
      /#include\s*<vector>/,
      /#include\s*<string>/,
      /#include\s*<map>/,
      /#include\s*<algorithm>/,
      /#include\s*<memory>/,
      /#include\s*<fstream>/,
      // std namespace usage (UNIQUE)
      /std::cout\s*<</,
      /std::cin\s*>>/,
      /std::endl/,
      /std::string\b/,
      /std::vector\s*</,
      /std::map\s*</,
      /std::unique_ptr\s*</,
      /std::shared_ptr\s*</,
      // using namespace std
      /using\s+namespace\s+std\s*;/,
      // C++ main
      /int\s+main\s*\(\s*(int\s+argc\s*,\s*char\s*\*?\s*\*?\s*argv\s*\[\s*\]|void)?\s*\)/,
      // C++ class with access specifiers
      /class\s+\w+\s*(:\s*(public|private|protected)\s+\w+)?\s*\{[\s\S]*?(public|private|protected)\s*:/,
      // Template (UNIQUE to C++)
      /template\s*<\s*(typename|class)\s+\w+/,
    ],
    patterns: [
      /#include\s*<[\w.]+>/,
      /#include\s*"[\w.]+"/,
      /std::\w+/,
      /cout\s*<</,
      /cin\s*>>/,
      /nullptr/,
      /::\w+/,
      /public:/,
      /private:/,
      /protected:/,
      /virtual\s+\w+/,
      /override\s*;/,
      /const\s+\w+\s*&/,
      /\w+\s*\*\s+\w+/,
    ],
    keywords: ["namespace", "template", "typename", "virtual", "override", "nullptr", "constexpr", "auto", "decltype", "static_cast", "dynamic_cast", "const_cast", "reinterpret_cast", "friend", "inline", "mutable"],
    weight: 1.6,
  },
  {
    language: "c",
    strongIndicators: [
      // C standard library headers (UNIQUE to C)
      /#include\s*<stdio\.h>/,
      /#include\s*<stdlib\.h>/,
      /#include\s*<string\.h>/,
      /#include\s*<math\.h>/,
      /#include\s*<ctype\.h>/,
      /#include\s*<time\.h>/,
      /#include\s*<stdbool\.h>/,
      // printf/scanf (mostly C)
      /printf\s*\(\s*"/,
      /scanf\s*\(\s*"/,
      /fprintf\s*\(/,
      /fscanf\s*\(/,
      // C main without iostream style
      /int\s+main\s*\(\s*(void)?\s*\)\s*\{/,
      // Memory management C-style
      /malloc\s*\(\s*sizeof/,
      /calloc\s*\(/,
      /realloc\s*\(/,
      /free\s*\(\s*\w+\s*\)/,
    ],
    patterns: [
      /printf\s*\(/,
      /scanf\s*\(/,
      /sizeof\s*\(/,
      /struct\s+\w+\s*\{/,
      /typedef\s+struct/,
      /typedef\s+enum/,
      /#define\s+\w+/,
      /#ifdef\s+\w+/,
      /#ifndef\s+\w+/,
      /#endif/,
      /NULL\b/,
      /\w+\s*\*\s*\w+\s*=/,
      /&\w+/,
    ],
    keywords: ["printf", "scanf", "malloc", "free", "calloc", "realloc", "sizeof", "typedef", "struct", "union", "enum", "extern", "register", "volatile", "NULL", "FILE"],
    weight: 1.3,
  },
  {
    language: "csharp",
    strongIndicators: [
      // C# using statements (UNIQUE pattern)
      /^using\s+System(\.\w+)*;$/m,
      /^using\s+(Microsoft|Newtonsoft|NUnit|Xunit)\.[\w.]+;$/m,
      // C# namespace (UNIQUE format)
      /^namespace\s+[\w.]+\s*(\{|;)$/m,
      // C# Console (UNIQUE)
      /Console\.(WriteLine|ReadLine|Write|Read)\s*\(/,
      // C# properties (UNIQUE syntax)
      /\{\s*get\s*;\s*set\s*;\s*\}/,
      /\{\s*get\s*;\s*\}/,
      /\{\s*get\s*=>/,
      // C# attributes (UNIQUE)
      /\[\w+(\([^\]]*\))?\]\s*(public|private|protected|internal)/,
      /\[HttpGet\]/,
      /\[HttpPost\]/,
      /\[Route\(/,
      // C# async Task
      /async\s+Task(<\w+>)?\s+\w+\s*\(/,
      // C# LINQ
      /\.(Where|Select|OrderBy|FirstOrDefault|ToList|Any|All)\s*\(/,
      // C# string interpolation
      /\$"[^"]*\{[^}]+\}[^"]*"/,
    ],
    patterns: [
      /public\s+class\s+\w+/,
      /public\s+interface\s+\w+/,
      /public\s+override/,
      /\?\?/,
      /\?\./,
      /var\s+\w+\s*=/,
      /new\s+\w+\s*\{/,
      /sealed\s+class/,
      /partial\s+class/,
      /virtual\s+\w+/,
    ],
    keywords: ["namespace", "using", "partial", "sealed", "abstract", "virtual", "override", "async", "await", "var", "dynamic", "object", "string", "decimal", "internal", "readonly", "ref", "out", "params"],
    weight: 1.6,
  },
  {
    language: "go",
    strongIndicators: [
      // Go package declaration (UNIQUE)
      /^package\s+(main|\w+)\s*$/m,
      // Go func main (UNIQUE)
      /^func\s+main\s*\(\s*\)\s*\{/m,
      // Go fmt package (UNIQUE)
      /fmt\.(Println|Printf|Print|Sprintf|Fprintf)\s*\(/,
      // Go import block (UNIQUE)
      /^import\s+\(\s*$/m,
      // Go short variable declaration (UNIQUE)
      /\w+\s*:=\s*\w+/,
      // Go function with receiver
      /^func\s+\(\s*\w+\s+\*?\w+\s*\)\s+\w+\s*\(/m,
      // Go error handling pattern (UNIQUE)
      /if\s+err\s*!=\s*nil\s*\{/,
      // Go defer (UNIQUE)
      /defer\s+\w+\.(Close|Unlock|Done)\s*\(\)/,
      // Go goroutine
      /go\s+func\s*\(/,
      /go\s+\w+\s*\(/,
    ],
    patterns: [
      /func\s+\w+\s*\(/,
      /var\s+\w+\s+\w+/,
      /const\s+\w+\s*=/,
      /type\s+\w+\s+struct\s*\{/,
      /type\s+\w+\s+interface\s*\{/,
      /make\s*\(\s*(map|chan|slice|\[\])/,
      /range\s+\w+/,
      /chan\s+\w+/,
      /<-\s*\w+/,
      /\w+\s*<-/,
    ],
    keywords: ["package", "import", "func", "var", "const", "type", "struct", "interface", "map", "chan", "go", "defer", "select", "range", "fallthrough", "nil"],
    weight: 1.7,
  },
  {
    language: "rust",
    strongIndicators: [
      // Rust fn main (UNIQUE)
      /^fn\s+main\s*\(\s*\)\s*(->[\s\w<>]+)?\s*\{/m,
      // Rust macros (UNIQUE)
      /println!\s*\(/,
      /print!\s*\(/,
      /format!\s*\(/,
      /vec!\s*\[/,
      /panic!\s*\(/,
      // Rust let mut (UNIQUE)
      /let\s+mut\s+\w+/,
      // Rust impl (UNIQUE)
      /^impl(<[\w,\s<>]+>)?\s+\w+(<[\w,\s<>]+>)?\s+(for\s+\w+(<[\w,\s<>]+>)?\s+)?\{/m,
      // Rust use (UNIQUE pattern)
      /use\s+std::\w+/,
      /use\s+crate::\w+/,
      // Rust Option/Result (UNIQUE)
      /Option<[\w<>]+>/,
      /Result<[\w<>]+,\s*[\w<>]+>/,
      /Some\s*\(/,
      /\bNone\b/,
      /Ok\s*\(/,
      /Err\s*\(/,
      // Rust ownership
      /&mut\s+\w+/,
      /&'\w+\s+/,
    ],
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+\w+\s*:/,
      /pub\s+(fn|struct|enum|mod|trait)/,
      /mod\s+\w+\s*\{/,
      /trait\s+\w+\s*\{/,
      /match\s+\w+\s*\{/,
      /=>\s*\{/,
      /\|\w+\|\s*\{/,
      /\.unwrap\s*\(\)/,
      /\.expect\s*\(/,
      /\.map\s*\(\|/,
      /\.filter\s*\(\|/,
    ],
    keywords: ["fn", "let", "mut", "impl", "trait", "struct", "enum", "pub", "mod", "use", "crate", "self", "super", "where", "async", "await", "unsafe", "dyn", "move", "ref", "match"],
    weight: 1.8,
  },
  {
    language: "php",
    strongIndicators: [
      // PHP opening tag (UNIQUE)
      /<\?php/,
      /<\?=/,
      // PHP superglobals (UNIQUE)
      /\$_GET\[/,
      /\$_POST\[/,
      /\$_SESSION\[/,
      /\$_REQUEST\[/,
      /\$_SERVER\[/,
      /\$_FILES\[/,
      /\$_COOKIE\[/,
      // PHP $this (UNIQUE)
      /\$this->\w+/,
      // PHP namespace (UNIQUE pattern)
      /^namespace\s+[\w\\]+;$/m,
      // PHP use statement
      /^use\s+[\w\\]+;$/m,
      // PHP function with $
      /function\s+\w+\s*\([^)]*\$\w+/,
    ],
    patterns: [
      /\$\w+\s*=/,
      /echo\s+/,
      /print_r\s*\(/,
      /var_dump\s*\(/,
      /public\s+function\s+\w+/,
      /private\s+function\s+\w+/,
      /protected\s+function\s+\w+/,
      /static\s+function\s+\w+/,
      /->[\w]+\s*\(/,
      /array\s*\(/,
      /\[\s*['"]?\w+['"]?\s*=>/,
      /::\w+\s*\(/,
    ],
    keywords: ["echo", "print", "isset", "unset", "empty", "die", "exit", "include", "require", "include_once", "require_once", "namespace", "use", "trait", "abstract", "final", "clone"],
    weight: 1.7,
  },
  {
    language: "ruby",
    strongIndicators: [
      // Ruby require (UNIQUE pattern)
      /^require\s+['"][\w\/]+['"]\s*$/m,
      /^require_relative\s+['"][\w\/]+['"]\s*$/m,
      // Ruby blocks (UNIQUE)
      /\.each\s+do\s*\|\w+\|/,
      /\.map\s+do\s*\|\w+\|/,
      /\.select\s+do\s*\|\w+\|/,
      // Ruby attr accessors (UNIQUE)
      /attr_accessor\s+:\w+/,
      /attr_reader\s+:\w+/,
      /attr_writer\s+:\w+/,
      // Ruby def initialize (UNIQUE)
      /def\s+initialize\s*\(/,
      // Ruby puts (mostly Ruby)
      /^puts\s+/m,
      // Ruby symbols (UNIQUE)
      /:\w+\s*=>/,
      /\w+:\s*['"\w]/,
      // Ruby class inheritance
      /class\s+\w+\s*<\s*\w+/,
      // Ruby end keyword pattern
      /^\s*end\s*$/m,
    ],
    patterns: [
      /def\s+\w+/,
      /\|[\w,\s]+\|/,
      /@\w+\s*=/,
      /@@\w+/,
      /do\s*$/m,
      /\.each\s*\{/,
      /\.map\s*\{/,
      /\.select\s*\{/,
      /unless\s+/,
      /until\s+/,
      /\bnil\b/,
    ],
    keywords: ["def", "end", "class", "module", "attr_accessor", "attr_reader", "attr_writer", "puts", "gets", "require", "include", "extend", "yield", "lambda", "proc", "nil", "unless", "until", "elsif", "when", "then"],
    weight: 1.5,
  },
  {
    language: "swift",
    strongIndicators: [
      // Swift imports (UNIQUE)
      /^import\s+(Foundation|UIKit|SwiftUI|Combine|CoreData|MapKit|AVFoundation)$/m,
      // Swift func with return type (UNIQUE pattern)
      /func\s+\w+\s*\([^)]*\)\s*->\s*\w+(\?|!)?\s*\{/,
      // Swift guard let (UNIQUE)
      /guard\s+let\s+\w+\s*=\s*\w+/,
      // Swift if let (UNIQUE)
      /if\s+let\s+\w+\s*=\s*\w+/,
      // Swift optional type (UNIQUE)
      /var\s+\w+\s*:\s*\w+\s*\?/,
      /let\s+\w+\s*:\s*\w+\s*!/,
      // Swift IBOutlet/IBAction (UNIQUE)
      /@IBOutlet\s+/,
      /@IBAction\s+/,
      /@Published\s+/,
      /@State\s+/,
      /@Binding\s+/,
      /@ObservedObject\s+/,
      // Swift override func (UNIQUE pattern)
      /override\s+func\s+\w+/,
      // Swift closure syntax (UNIQUE)
      /\{\s*\(\w+\)\s*->\s*\w+\s+in/,
      /\{\s*\w+\s+in/,
    ],
    patterns: [
      /func\s+\w+\s*\(/,
      /var\s+\w+\s*:/,
      /let\s+\w+\s*:/,
      /class\s+\w+\s*:/,
      /struct\s+\w+\s*(:\s*\w+)?\s*\{/,
      /enum\s+\w+\s*\{/,
      /protocol\s+\w+\s*\{/,
      /extension\s+\w+\s*(:\s*\w+)?\s*\{/,
      /print\s*\(/,
      /\?\?/,
      /\?\./,
      /\.map\s*\{\s*\$/,
      /\.filter\s*\{\s*\$/,
    ],
    keywords: ["func", "var", "let", "guard", "defer", "import", "class", "struct", "enum", "protocol", "extension", "typealias", "associatedtype", "inout", "mutating", "fileprivate", "internal", "open", "weak", "unowned", "lazy", "didSet", "willSet"],
    weight: 1.4,
  },
  {
    language: "kotlin",
    strongIndicators: [
      // Kotlin fun main (UNIQUE)
      /fun\s+main\s*\(\s*(args\s*:\s*Array<String>)?\s*\)\s*\{/,
      // Kotlin println (UNIQUE)
      /println\s*\(/,
      // Kotlin data class (UNIQUE)
      /data\s+class\s+\w+\s*\(/,
      // Kotlin val/var with type (UNIQUE pattern)
      /val\s+\w+\s*:\s*\w+(<[\w,\s<>]+>)?\s*=/,
      /var\s+\w+\s*:\s*\w+(<[\w,\s<>]+>)?\s*=/,
      // Kotlin companion object (UNIQUE)
      /companion\s+object\s*\{/,
      // Kotlin nullable (UNIQUE)
      /\w+\?\.let\s*\{/,
      /\?\./,
      /!!/,
      // Kotlin when (UNIQUE)
      /when\s*\([^)]+\)\s*\{/,
      // Kotlin object declaration
      /object\s+\w+\s*(:\s*\w+)?\s*\{/,
      // Kotlin suspend (UNIQUE)
      /suspend\s+fun\s+\w+/,
    ],
    patterns: [
      /fun\s+\w+\s*\(/,
      /val\s+\w+\s*[=:]/,
      /var\s+\w+\s*[=:]/,
      /class\s+\w+\s*\(/,
      /sealed\s+class/,
      /it\.\w+/,
      /it\s*->/,
      /\{\s*\w+\s*->/,
      /\.let\s*\{/,
      /\.apply\s*\{/,
      /\.run\s*\{/,
      /\.also\s*\{/,
    ],
    keywords: ["fun", "val", "var", "when", "data", "object", "companion", "sealed", "inline", "reified", "suspend", "lateinit", "by", "lazy", "init", "internal", "crossinline", "noinline"],
    weight: 1.5,
  },
  {
    language: "html",
    strongIndicators: [
      // HTML doctype (UNIQUE)
      /<!DOCTYPE\s+html>/i,
      // HTML structure (UNIQUE)
      /<html[\s>]/i,
      /<head[\s>][\s\S]*?<\/head>/i,
      /<body[\s>]/i,
      // HTML meta tags (UNIQUE)
      /<meta\s+[^>]*charset/i,
      /<meta\s+[^>]*viewport/i,
      /<link\s+[^>]*rel\s*=\s*["']stylesheet["']/i,
      // HTML script/style tags (UNIQUE)
      /<script[\s>]/i,
      /<style[\s>]/i,
    ],
    patterns: [
      /<div[\s>]/i,
      /<span[\s>]/i,
      /<p[\s>]/i,
      /<a\s+href/i,
      /<img\s+[^>]*src/i,
      /<\/\w+>/,
      /<form[\s>]/i,
      /<input[\s>]/i,
      /<button[\s>]/i,
      /<h[1-6][\s>]/i,
      /<ul[\s>]/i,
      /<li[\s>]/i,
      /<table[\s>]/i,
      /<nav[\s>]/i,
      /<header[\s>]/i,
      /<footer[\s>]/i,
      /<section[\s>]/i,
      /<article[\s>]/i,
    ],
    keywords: [],
    weight: 1.8,
  },
  {
    language: "css",
    strongIndicators: [
      // CSS rule blocks (UNIQUE)
      /^[\w.#\-\[\]='"~^$*:,\s]+\s*\{[\s\S]*?\}/m,
      // CSS at-rules (UNIQUE)
      /@media\s+\(?(screen|print|all|min-width|max-width)/,
      /@keyframes\s+\w+\s*\{/,
      /@import\s+(url\()?['"][^'"]+['"]\)?;/,
      /@font-face\s*\{/,
      // CSS properties (UNIQUE format)
      /display\s*:\s*(flex|grid|block|inline-block|none)\s*;/,
      /position\s*:\s*(relative|absolute|fixed|sticky)\s*;/,
      /background(-color)?\s*:\s*[^;]+;/,
    ],
    patterns: [
      /[a-z-]+\s*:\s*[^;{}]+;/,
      /\.[\w-]+\s*\{/,
      /#[\w-]+\s*\{/,
      /:hover\s*\{/,
      /:focus\s*\{/,
      /:active\s*\{/,
      /::before/,
      /::after/,
      /!important/,
      /\d+(px|em|rem|%|vh|vw|vmin|vmax)\b/,
      /var\s*\(\s*--[\w-]+\s*\)/,
      /calc\s*\(/,
      /rgba?\s*\(/,
      /hsla?\s*\(/,
    ],
    keywords: [],
    weight: 1.8,
  },
  {
    language: "sql",
    strongIndicators: [
      // SQL SELECT (UNIQUE structure)
      /SELECT\s+(DISTINCT\s+)?[\w*,\s.]+\s+FROM\s+\w+/i,
      // SQL INSERT (UNIQUE)
      /INSERT\s+INTO\s+\w+\s*\([^)]+\)\s*VALUES/i,
      // SQL UPDATE (UNIQUE)
      /UPDATE\s+\w+\s+SET\s+\w+\s*=/i,
      // SQL CREATE TABLE (UNIQUE)
      /CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?\w+\s*\(/i,
      // SQL ALTER TABLE (UNIQUE)
      /ALTER\s+TABLE\s+\w+\s+(ADD|DROP|MODIFY|ALTER)\s+/i,
      // SQL DROP (UNIQUE)
      /DROP\s+TABLE\s+(IF\s+EXISTS\s+)?\w+/i,
      // SQL JOINs (UNIQUE)
      /(INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\s+\w+\s+ON\s+/i,
      // SQL constraints
      /PRIMARY\s+KEY\s*\(/i,
      /FOREIGN\s+KEY\s*\(/i,
      /REFERENCES\s+\w+\s*\(/i,
    ],
    patterns: [
      /DELETE\s+FROM\s+\w+/i,
      /WHERE\s+\w+\s*(=|<|>|LIKE|IN|IS)/i,
      /GROUP\s+BY\s+[\w,\s]+/i,
      /ORDER\s+BY\s+[\w,\s]+(ASC|DESC)?/i,
      /HAVING\s+/i,
      /LIMIT\s+\d+/i,
      /OFFSET\s+\d+/i,
      /AS\s+\w+/i,
      /COUNT\s*\(/i,
      /SUM\s*\(/i,
      /AVG\s*\(/i,
      /MAX\s*\(/i,
      /MIN\s*\(/i,
      /CASE\s+WHEN\s+/i,
    ],
    keywords: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "ON", "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN", "GROUP", "ORDER", "BY", "HAVING", "UNION", "INDEX", "PRIMARY", "FOREIGN", "KEY", "CONSTRAINT", "DEFAULT", "NULL", "UNIQUE", "CHECK"],
    weight: 1.9,
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
      const matches = code.match(new RegExp(pattern, 'gm'));
      if (matches) {
        score += matches.length * 20; // Strong indicators worth much more
      }
    }

    // Check regular patterns
    for (const pattern of langPattern.patterns) {
      const matches = code.match(new RegExp(pattern, 'gm'));
      if (matches) {
        score += matches.length * 3;
      }
    }

    // Check keywords
    for (const keyword of langPattern.keywords) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = code.match(keywordRegex);
      if (matches) {
        score += matches.length * 2;
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
