export interface Issue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  line?: number;
  suggestion: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  complexity: number;
  functions: number;
  classes: number;
}

export interface AIDetectionResult {
  isLikelyAI: boolean;
  confidence: number;
  indicators: Array<{ type: 'ai' | 'human'; text: string }>;
}

export interface AnalysisResult {
  score: number;
  issues: Issue[];
  metrics: CodeMetrics;
  aiDetection: AIDetectionResult;
}

const LANGUAGE_PATTERNS: Record<string, {
  functionPattern: RegExp;
  classPattern: RegExp;
  commentPattern: RegExp;
}> = {
  javascript: {
    functionPattern: /function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|=>\s*{/g,
    classPattern: /class\s+\w+/g,
    commentPattern: /\/\/.*|\/\*[\s\S]*?\*\//g,
  },
  typescript: {
    functionPattern: /function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|=>\s*{/g,
    classPattern: /class\s+\w+|interface\s+\w+/g,
    commentPattern: /\/\/.*|\/\*[\s\S]*?\*\//g,
  },
  python: {
    functionPattern: /def\s+\w+/g,
    classPattern: /class\s+\w+/g,
    commentPattern: /#.*|'''[\s\S]*?'''|"""[\s\S]*?"""/g,
  },
  java: {
    functionPattern: /\w+\s+\w+\s*\([^)]*\)\s*{/g,
    classPattern: /class\s+\w+|interface\s+\w+/g,
    commentPattern: /\/\/.*|\/\*[\s\S]*?\*\//g,
  },
  cpp: {
    functionPattern: /\w+\s+\w+\s*\([^)]*\)\s*{/g,
    classPattern: /class\s+\w+|struct\s+\w+/g,
    commentPattern: /\/\/.*|\/\*[\s\S]*?\*\//g,
  },
  default: {
    functionPattern: /function\s+\w+|def\s+\w+|\w+\s*\([^)]*\)\s*{/g,
    classPattern: /class\s+\w+/g,
    commentPattern: /\/\/.*|#.*|\/\*[\s\S]*?\*\//g,
  },
};

function getLanguagePatterns(language: string) {
  return LANGUAGE_PATTERNS[language.toLowerCase()] || LANGUAGE_PATTERNS.default;
}

function calculateMetrics(code: string, language: string): CodeMetrics {
  const lines = code.split('\n');
  const patterns = getLanguagePatterns(language);
  
  const codeWithoutComments = code.replace(patterns.commentPattern, '');
  
  const commentLines = code.match(patterns.commentPattern)?.join('\n').split('\n').length || 0;
  const blankLines = lines.filter(line => line.trim() === '').length;
  const codeLines = lines.length - blankLines - commentLines;
  
  const functions = (codeWithoutComments.match(patterns.functionPattern) || []).length;
  const classes = (codeWithoutComments.match(patterns.classPattern) || []).length;
  
  // Estimate cyclomatic complexity
  const complexityKeywords = /if|else|for|while|case|catch|\?\?|\|\||&&/g;
  const complexity = Math.min(20, (codeWithoutComments.match(complexityKeywords) || []).length + functions);
  
  return {
    linesOfCode: lines.length,
    codeLines,
    commentLines,
    blankLines,
    complexity,
    functions,
    classes,
  };
}

function detectIssues(code: string, language: string): Issue[] {
  const issues: Issue[] = [];
  const lines = code.split('\n');
  
  // Common Programming Errors & Bugs
  
  // 1. Assignment in conditionals (= instead of ==)
  const assignmentInCondition = lines.map((line, idx) => {
    if (/if\s*\([^)]*[^=!<>]\s=\s[^=]/.test(line) && !/===|==/.test(line)) {
      return idx + 1;
    }
    return null;
  }).filter(Boolean);
  
  if (assignmentInCondition.length > 0) {
    assignmentInCondition.forEach(lineNum => {
      issues.push({
        type: 'critical',
        title: 'BUG: Assignment operator in conditional',
        description: `Line ${lineNum} uses assignment (=) instead of comparison (== or ===) in an if statement. This will always assign the value and evaluate to true/truthy, not compare values. This is almost always a bug.`,
        line: lineNum as number,
        suggestion: 'Change = to === for strict equality check. Example: if (n === 0) instead of if (n = 0). Use == only if you intentionally want type coercion.',
      });
    });
  }
  
  // 2. Missing template literal backticks
  const templateLiteralError = lines.map((line, idx) => {
    if (/console\.log\([^`]*\$\{/.test(line) || /return\s+[^`]*\$\{/.test(line)) {
      return idx + 1;
    }
    return null;
  }).filter(Boolean);
  
  if (templateLiteralError.length > 0) {
    templateLiteralError.forEach(lineNum => {
      issues.push({
        type: 'critical',
        title: 'SYNTAX ERROR: Missing backticks for template literal',
        description: `Line ${lineNum} uses template literal syntax (\${}) but is missing backticks. This will cause a syntax error. Template literals must use backticks (\`), not single or double quotes.`,
        line: lineNum as number,
        suggestion: 'Replace quotes with backticks: console.log(`Factorial of \${num} is: \${result}`);',
      });
    });
  }
  
  // 3. String passed to mathematical operations
  if (language.match(/javascript|typescript/)) {
    const mathWithStrings = lines.map((line, idx) => {
      if (/["']\d+["']/.test(line) && (
        /factorial|calculate|multiply|divide|add|subtract|Math\./i.test(lines.slice(Math.max(0, idx - 3), idx + 3).join(' '))
      )) {
        return idx + 1;
      }
      return null;
    }).filter(Boolean);
    
    if (mathWithStrings.length > 0) {
      mathWithStrings.forEach(lineNum => {
        issues.push({
          type: 'warning',
          title: 'BUG: String used in numeric context',
          description: `Line ${lineNum} uses a string (e.g., "5") where a number is expected. This can cause type coercion issues, NaN results, or unexpected string concatenation instead of addition.`,
          line: lineNum as number,
          suggestion: 'Remove quotes to use numbers: const number = 5; not const number = "5". Or parse strings: parseInt(str) or Number(str).',
        });
      });
    }
  }
  
  // 4. Common typos and mistakes
  const commonMistakes = [
    { pattern: /lenght/, fix: 'length', name: 'lenght' },
    { pattern: /fucntion/, fix: 'function', name: 'fucntion' },
    { pattern: /retrun/, fix: 'return', name: 'retrun' },
    { pattern: /consoel/, fix: 'console', name: 'consoel' },
    { pattern: /udefined/, fix: 'undefined', name: 'udefined' },
  ];
  
  commonMistakes.forEach(mistake => {
    const typoLines = lines.map((line, idx) => mistake.pattern.test(line) ? idx + 1 : null).filter(Boolean);
    if (typoLines.length > 0) {
      issues.push({
        type: 'critical',
        title: `TYPO: '${mistake.name}' should be '${mistake.fix}'`,
        description: `Found typo on line ${typoLines[0]}. This will cause a ReferenceError or unexpected behavior.`,
        line: typoLines[0] as number,
        suggestion: `Correct the spelling to '${mistake.fix}'.`,
      });
    }
  });
  
  // 5. Missing semicolons (potentially problematic)
  if (language.match(/javascript|typescript/)) {
    let missingSemicolonCount = 0;
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && 
          /^(const|let|var|return)\s/.test(trimmed) && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') &&
          !trimmed.endsWith(',') &&
          idx < lines.length - 1) {
        missingSemicolonCount++;
      }
    });
    
    if (missingSemicolonCount > 3) {
      issues.push({
        type: 'info',
        title: 'Missing semicolons detected',
        description: `Found ${missingSemicolonCount} statements without semicolons. While JavaScript has ASI (Automatic Semicolon Insertion), it can cause subtle bugs in certain cases.`,
        suggestion: 'Add semicolons at the end of statements, or use a linter like ESLint with automatic fixing to enforce consistency.',
      });
    }
  }
  
  // 6. Unused variables
  if (language.match(/javascript|typescript/)) {
    const declaredVars = new Set<string>();
    const usedVars = new Set<string>();
    
    lines.forEach(line => {
      const varDeclarations = line.match(/(?:const|let|var)\s+(\w+)/g);
      if (varDeclarations) {
        varDeclarations.forEach(decl => {
          const match = decl.match(/\s+(\w+)/);
          if (match) declaredVars.add(match[1]);
        });
      }
    });
    
    code.split(/\s+/).forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned && declaredVars.has(cleaned)) {
        usedVars.add(cleaned);
      }
    });
    
    const unused = Array.from(declaredVars).filter(v => {
      const usage = code.split(v).length - 1;
      return usage <= 1; // Only declared, never used elsewhere
    });
    
    if (unused.length > 0) {
      issues.push({
        type: 'info',
        title: `Unused variable${unused.length > 1 ? 's' : ''}: ${unused.join(', ')}`,
        description: `Declared ${unused.length} variable(s) that are never used. Dead code clutters the codebase and may indicate incomplete refactoring.`,
        suggestion: 'Remove unused variables or use them if they were meant to be used. Modern IDEs can highlight these automatically.',
      });
    }
  }
  
  // 7. Missing return statement
  if (language.match(/javascript|typescript/)) {
    let inFunction = false;
    let functionStart = 0;
    let hasReturn = false;
    let braceCount = 0;
    
    lines.forEach((line, idx) => {
      if (/function\s+\w+/.test(line) && !line.includes('=>')) {
        inFunction = true;
        functionStart = idx;
        hasReturn = false;
        braceCount = 0;
      }
      
      if (inFunction) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;
        
        if (/return\s/.test(line)) {
          hasReturn = true;
        }
        
        if (braceCount === 0 && idx > functionStart) {
          if (!hasReturn && lines.slice(functionStart, idx + 1).join(' ').length > 100) {
            issues.push({
              type: 'warning',
              title: 'Function may be missing return statement',
              description: `Function starting at line ${functionStart + 1} has no return statement. If this function should return a value, it will return undefined.`,
              line: functionStart + 1,
              suggestion: 'Add a return statement if the function should return a value, or clarify if it\'s intentionally a void function.',
            });
          }
          inFunction = false;
        }
      }
    });
  }
  
  // Advanced Security Analysis
  
  // 1. eval() - Critical Security Risk
  if (/eval\s*\(/i.test(code)) {
    const evalLines = lines.map((line, idx) => line.match(/eval\s*\(/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Critical: eval() allows arbitrary code execution',
      description: `Found on line ${evalLines[0]}. The eval() function executes any string as code, making it extremely dangerous. Attackers can inject malicious code that will run with full application privileges, potentially stealing data, modifying behavior, or compromising the entire system.`,
      line: evalLines[0] as number,
      suggestion: 'Replace eval() with safer alternatives: For JSON parsing, use JSON.parse(). For mathematical expressions, use a safe expression evaluator library like math.js. If you absolutely need dynamic code, use new Function() with strict validation and Content Security Policy headers.',
    });
  }
  
  // 2. XSS via innerHTML - Critical
  if (/innerHTML\s*=/i.test(code)) {
    const innerHTMLLines = lines.map((line, idx) => line.match(/innerHTML\s*=/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Critical XSS Risk: Direct innerHTML manipulation',
      description: `Detected on line ${innerHTMLLines[0]}. Setting innerHTML with unsanitized user input allows attackers to inject malicious scripts that execute in users' browsers, potentially stealing cookies, session tokens, or performing unauthorized actions.`,
      line: innerHTMLLines[0] as number,
      suggestion: 'Use textContent for plain text (e.g., element.textContent = userInput). For HTML content, sanitize using DOMPurify: element.innerHTML = DOMPurify.sanitize(userInput). Or use createElement() and setAttribute() for dynamic content. Modern frameworks like React automatically escape content.',
    });
  }
  
  // 3. SQL Injection - Critical
  if (/(SELECT|INSERT|UPDATE|DELETE).*(\+|concat|\$\{).*['"`]/i.test(code)) {
    const sqlLines = lines.map((line, idx) => 
      line.match(/(SELECT|INSERT|UPDATE|DELETE).*(\+|concat|\$\{).*['"`]/i) ? idx + 1 : null
    ).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Critical SQL Injection vulnerability',
      description: `Found on line ${sqlLines[0]}. String concatenation in SQL queries allows attackers to modify query logic, bypass authentication, steal data, or delete entire databases. This is one of the most dangerous web vulnerabilities.`,
      line: sqlLines[0] as number,
      suggestion: language.match(/javascript|typescript/) 
        ? 'Use parameterized queries: db.query("SELECT * FROM users WHERE id = $1", [userId]) or prepared statements. With ORMs like Prisma: prisma.user.findUnique({ where: { id } }). Never concatenate user input into SQL strings.'
        : language.match(/python/) 
        ? 'Use parameterized queries: cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,)) or ORM methods. Never use string formatting (f-strings, %) with SQL.'
        : 'Use prepared statements with bound parameters. Never concatenate user input into SQL queries.',
    });
  }
  
  // 4. Hardcoded Secrets - Critical
  if (/(?:password|api[_-]?key|secret|token|auth)\s*[=:]\s*['"][^'"]{8,}['"]/i.test(code)) {
    const credLines = lines.map((line, idx) => 
      line.match(/(?:password|api[_-]?key|secret|token|auth)\s*[=:]\s*['"][^'"]{8,}['"]/i) ? idx + 1 : null
    ).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Critical: Hardcoded credentials detected',
      description: `Found on line ${credLines[0]}. Credentials in source code are exposed in version control history forever, even if deleted later. They can be discovered through GitHub searches, leaked repositories, or compromised systems.`,
      line: credLines[0] as number,
      suggestion: 'Store secrets in environment variables: process.env.API_KEY or os.environ["API_KEY"]. Use .env files locally (add to .gitignore!). In production, use secret managers like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault. Rotate exposed credentials immediately.',
    });
  }
  
  // 5. Weak Cryptography
  if (/md5|sha1(?!\d)|base64(?!url).*password/i.test(code)) {
    issues.push({
      type: 'critical',
      title: 'Weak cryptographic algorithm detected',
      description: 'MD5 and SHA1 are cryptographically broken and can be cracked in seconds. Base64 is encoding, not encryption. Using weak crypto for passwords means attackers can reverse them easily.',
      suggestion: language.match(/javascript|typescript/)
        ? 'For passwords, use bcrypt (12+ rounds) or Argon2: await bcrypt.hash(password, 12). For hashing, use SHA-256 or better. For encryption, use AES-256-GCM. Never roll your own crypto.'
        : 'Use bcrypt, Argon2, or PBKDF2 for passwords with proper salts. For hashing, use SHA-256+. For encryption, use established libraries with modern algorithms.',
    });
  }
  
  // Code Quality Issues
  
  // 6. Console statements
  const consoleCount = (code.match(/console\.(log|error|warn|debug|info)/g) || []).length;
  if (consoleCount > 5) {
    issues.push({
      type: 'warning',
      title: `${consoleCount} console statements found`,
      description: 'Console logs in production expose sensitive data (user IDs, API responses, internal logic) to anyone with browser DevTools. They also impact performance and clutter the console, making real errors harder to spot.',
      suggestion: language.match(/javascript|typescript/)
        ? 'Remove console.* before deploying. Use a proper logger (Winston, Pino, or Bunyan) with environment-based levels: if (process.env.NODE_ENV !== "production") console.log(). Set up error tracking with Sentry or similar.'
        : 'Remove print/debug statements. Use a logging framework with configurable levels (logging, log4j) that can be disabled in production.',
    });
  }
  
  // 7. Missing Error Handling
  if (language.match(/javascript|typescript|python|java/) && 
      (code.match(/async|await|fetch|axios|request|Promise|\.then\(/i) && !code.match(/try|catch|except|throw|\.catch\(|error/i))) {
    issues.push({
      type: 'warning',
      title: 'Missing error handling for async operations',
      description: 'Async code without error handling causes unhandled promise rejections, crashes, silent failures, or leaves the app in an inconsistent state. Users see generic errors or worse - no error at all.',
      suggestion: language.match(/javascript|typescript/)
        ? 'Wrap async code in try-catch: try { const data = await fetch(url); } catch (error) { console.error("API failed:", error); showToast("Error loading data"); }. Use .catch() for promises. Add global error handlers for unhandled rejections.'
        : 'Add try-except blocks around all async/IO operations. Log errors and provide user feedback. Use context managers (with statements) for resource cleanup.',
    });
  }
  
  // 8. TODO/FIXME comments
  const todoCount = (code.match(/TODO|FIXME|HACK|XXX|BUG/gi) || []).length;
  if (todoCount > 0) {
    const todoLines = lines.map((line, idx) => line.match(/TODO|FIXME|HACK|XXX|BUG/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'info',
      title: `${todoCount} unfinished task marker${todoCount > 1 ? 's' : ''} (TODO/FIXME)`,
      description: `Found starting at line ${todoLines[0]}. These comments indicate incomplete features, temporary workarounds, or known bugs. Shipping code with TODOs means you're deploying unfinished work.`,
      line: todoLines[0] as number,
      suggestion: 'Review each TODO: Complete the work, create a ticket in your issue tracker (Jira, Linear, GitHub Issues) with proper priority, or remove if no longer relevant. Assign owners and due dates. Never deploy critical TODOs.',
    });
  }
  
  // 9. Magic Numbers
  const magicNumbers = code.match(/\b(?<!\.)\d{3,}\b(?!\s*[a-zA-Z_])/g);
  if (magicNumbers && magicNumbers.length > 3) {
    issues.push({
      type: 'info',
      title: 'Magic numbers detected - use named constants',
      description: 'Unexplained numbers like 86400, 1000, 3600 make code hard to understand and maintain. When the same number appears multiple times, changing it requires finding every instance.',
      suggestion: 'Replace with named constants: const SECONDS_IN_DAY = 86400; const MAX_RETRIES = 3; const DEFAULT_TIMEOUT_MS = 5000. Use SCREAMING_SNAKE_CASE for constants. Group related constants in an object or enum.',
    });
  }
  
  // 10. Insufficient Documentation
  const metrics = calculateMetrics(code, language);
  const commentRatio = metrics.commentLines / (metrics.codeLines || 1);
  if (metrics.functions > 3 && commentRatio < 0.1) {
    issues.push({
      type: 'info',
      title: 'Low code documentation',
      description: `Found ${metrics.functions} functions but only ${Math.round(commentRatio * 100)}% comments. Undocumented code is a maintenance nightmare. Future developers (including you in 6 months) won't understand the "why" behind decisions.`,
      suggestion: language.match(/javascript|typescript/)
        ? 'Add JSDoc comments: /** @param {string} userId - Unique user identifier * @returns {Promise<User>} User object * @throws {NotFoundError} If user doesn\'t exist */. Document complex logic, edge cases, and business rules. Use clear variable names to reduce need for comments.'
        : language.match(/python/)
        ? 'Add docstrings: """Fetch user by ID. Args: user_id (str): Unique identifier. Returns: User: User object. Raises: NotFoundError: If user not found.""". Follow PEP 257 conventions.'
        : 'Add function/method documentation explaining parameters, return values, exceptions, and purpose. Document non-obvious logic and business rules.',
    });
  }
  
  // 11. Long Functions
  let inFunction = false;
  let functionStart = 0;
  let braceCount = 0;
  lines.forEach((line, idx) => {
    if (!inFunction && /function|def |fn |func /.test(line)) {
      inFunction = true;
      functionStart = idx;
      braceCount = 0;
    }
    if (inFunction) {
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      if (braceCount === 0 && (idx - functionStart) > 60) {
        issues.push({
          type: 'info',
          title: 'Long function detected',
          description: `Function starting at line ${functionStart + 1} spans ${idx - functionStart} lines. Long functions are hard to test, understand, debug, and reuse. They often violate the Single Responsibility Principle.`,
          line: functionStart + 1,
          suggestion: 'Break down into smaller functions with clear names: extract repeated logic, separate concerns (validation, processing, formatting), create helper functions. Aim for functions under 30 lines that do one thing well.',
        });
        inFunction = false;
      }
    }
  });
  
  // 12. Commented-out code
  const commentedCodeLines = lines.filter(line => 
    /^[\s]*\/\/\s*[a-zA-Z]+.*[;{}\(\)]/.test(line) || 
    /^[\s]*#\s*[a-zA-Z]+.*[;:\(\)]/.test(line)
  ).length;
  if (commentedCodeLines > 3) {
    issues.push({
      type: 'info',
      title: 'Commented-out code found',
      description: `Found ${commentedCodeLines} lines of commented code. Commented code creates confusion, clutter, and false positives in searches. Version control (Git) already preserves history.`,
      suggestion: 'Delete commented code - it\'s in Git history if you need it. If keeping for reference, add a comment explaining why and when to remove it. Better: use feature flags for experimental code.',
    });
  }
  
  return issues;
}

function detectAIGeneration(code: string, language: string): AIDetectionResult {
  const indicators: Array<{ type: 'ai' | 'human'; text: string }> = [];
  let aiScore = 0;
  let humanScore = 0;
  
  const lines = code.split('\n');
  
  // 1. Perfect Indentation Pattern (strong AI indicator)
  const perfectIndentation = lines.filter(line => {
    const spaces = line.match(/^\s*/)?.[0].length || 0;
    return line.trim().length === 0 || spaces % 2 === 0 || spaces % 4 === 0;
  }).length;
  
  if (perfectIndentation / lines.length > 0.95) {
    aiScore += 18;
    indicators.push({ 
      type: 'ai', 
      text: 'Perfect, consistent indentation throughout (95%+ lines). Human code typically has occasional spacing inconsistencies from quick edits or multiple authors.' 
    });
  } else if (perfectIndentation / lines.length < 0.85) {
    humanScore += 15;
    indicators.push({ 
      type: 'human', 
      text: 'Inconsistent indentation patterns. Natural when code evolves over time with different edits.' 
    });
  }
  
  // 2. Generic Variable Names (AI tends to use more generic names)
  const genericNames = /\b(data|result|response|item|value|temp|tmp|foo|bar|obj|arr|element|config|options|params)\b/g;
  const totalVars = (code.match(/\b(?:const|let|var|def|auto|int|string)\s+(\w+)/g) || []).length;
  const genericCount = (code.match(genericNames) || []).length;
  const genericRatio = totalVars > 0 ? genericCount / totalVars : 0;
  
  if (genericRatio > 0.4) {
    aiScore += 22;
    indicators.push({ 
      type: 'ai', 
      text: `${Math.round(genericRatio * 100)}% generic variable names (data, result, item). AI models favor descriptive but generic naming patterns.` 
    });
  } else if (genericRatio < 0.2 && totalVars > 5) {
    humanScore += 12;
    indicators.push({ 
      type: 'human', 
      text: 'Domain-specific, contextual variable names showing familiarity with the problem space.' 
    });
  }
  
  // 3. Comment Style and Density
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#') || l.trim().startsWith('*'));
  const commentRatio = commentLines.length / lines.length;
  const formalComments = commentLines.filter(l => /\b(function|method|parameter|returns?|description|example)\b/i.test(l)).length;
  
  if (commentRatio > 0.25 && formalComments > commentLines.length * 0.5) {
    aiScore += 20;
    indicators.push({ 
      type: 'ai', 
      text: 'High density of formal documentation comments (JSDoc/docstring style). AI often generates comprehensive docs even for simple code.' 
    });
  } else if (commentRatio > 0 && commentRatio < 0.1 && formalComments < 2) {
    humanScore += 12;
    indicators.push({ 
      type: 'human', 
      text: 'Minimal, informal comments. Humans often under-document or add quick explanatory notes rather than formal docs.' 
    });
  }
  
  // 4. TODO/FIXME/Development Markers (strong human indicator)
  const devMarkers = (code.match(/TODO|FIXME|HACK|XXX|BUG|WIP|NOTE|TEMP/gi) || []).length;
  if (devMarkers > 0) {
    humanScore += 25;
    indicators.push({ 
      type: 'human', 
      text: `${devMarkers} development marker(s) found (TODO/FIXME/HACK). Strong indicator of iterative human development and self-reminders.` 
    });
  }
  
  // 5. Debug Statements (human trait)
  const debugStatements = (code.match(/console\.(log|debug|dir|table)|print\(|println\(|debugger;|dump\(/g) || []).length;
  if (debugStatements > 2) {
    humanScore += 18;
    indicators.push({ 
      type: 'human', 
      text: `${debugStatements} debug statement(s) present. Developers leave these during development; AI typically doesn't include them.` 
    });
  }
  
  // 6. Code Repetition Patterns
  const repeatedBlocks = new Map<string, number>();
  for (let i = 0; i < lines.length - 3; i++) {
    const block = lines.slice(i, i + 3).join('\n').trim();
    if (block.length > 20) {
      repeatedBlocks.set(block, (repeatedBlocks.get(block) || 0) + 1);
    }
  }
  const highRepetition = Array.from(repeatedBlocks.values()).filter(count => count > 2).length;
  
  if (highRepetition > 3) {
    aiScore += 15;
    indicators.push({ 
      type: 'ai', 
      text: 'Multiple highly repetitive code blocks. AI often generates similar patterns; humans typically refactor or vary implementations.' 
    });
  }
  
  // 7. Verbose, Descriptive Naming (AI trait)
  const longIdentifiers = code.match(/\b[a-z][a-zA-Z]{18,}\b/g);
  if (longIdentifiers && longIdentifiers.length > 4) {
    aiScore += 12;
    indicators.push({ 
      type: 'ai', 
      text: `${longIdentifiers.length} very long identifier(s) (19+ characters). AI favors verbose, self-documenting names; humans often abbreviate.` 
    });
  }
  
  // 8. Personal Style Quirks (strong human indicator)
  const casualLanguage = /\b(lol|wtf|damn|shit|crap|hell|hmm|oops|yikes)\b/i.test(code);
  if (casualLanguage) {
    humanScore += 30;
    indicators.push({ 
      type: 'human', 
      text: 'Informal/casual language in comments. Very strong indicator of human authorship - AI avoids unprofessional language.' 
    });
  }
  
  // 9. Irregular Spacing/Formatting (human trait)
  const irregularSpacing = /\(\s{2,}|\s{2,}\)|\{\s{2,}|\s{2,}\}|\s{3,}\w|=\s{2,}|,\s{3,}/g;
  const spacingIssues = (code.match(irregularSpacing) || []).length;
  if (spacingIssues > 3) {
    humanScore += 14;
    indicators.push({ 
      type: 'human', 
      text: 'Irregular spacing patterns detected. Human code often has spacing inconsistencies from manual typing and edits.' 
    });
  }
  
  // 10. Error Handling Presence (sophisticated indicator)
  const hasErrorHandling = /try|catch|except|throw|raise|error|Error|Exception/i.test(code);
  const hasComprehensiveHandling = (code.match(/try\s*{[\s\S]*?catch\s*\(/g) || []).length > 1;
  
  if (hasComprehensiveHandling && commentRatio > 0.2) {
    aiScore += 10;
    indicators.push({ 
      type: 'ai', 
      text: 'Comprehensive error handling with documentation. AI generates complete, defensive code patterns.' 
    });
  } else if (!hasErrorHandling && lines.length > 20) {
    humanScore += 8;
    indicators.push({ 
      type: 'human', 
      text: 'Minimal error handling in medium-length code. Humans often skip error handling in quick implementations.' 
    });
  }
  
  // 11. Code Structure Quality
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  if (avgLineLength > 60 && avgLineLength < 85 && perfectIndentation / lines.length > 0.9) {
    aiScore += 8;
    indicators.push({ 
      type: 'ai', 
      text: 'Consistently optimal line length (60-85 chars) with perfect structure. AI follows style guides precisely.' 
    });
  }
  
  // Calculate final confidence
  const totalScore = aiScore + humanScore;
  const aiConfidence = totalScore > 0 ? (aiScore / totalScore) * 100 : 50;
  
  // Sort indicators by relevance (AI indicators first if likely AI, human first if likely human)
  const sortedIndicators = indicators.sort((a, b) => {
    if (aiConfidence > 60) return a.type === 'ai' ? -1 : 1;
    return a.type === 'human' ? -1 : 1;
  });
  
  return {
    isLikelyAI: aiConfidence > 60,
    confidence: Math.round(aiConfidence),
    indicators: sortedIndicators.slice(0, 6),
  };
}

export function analyzeCode(code: string, language: string): AnalysisResult {
  if (!code.trim()) {
    return {
      score: 0,
      issues: [{
        type: 'warning',
        title: 'No code provided',
        description: 'Please enter code to analyze.',
        suggestion: 'Paste or upload code to get started.',
      }],
      metrics: {
        linesOfCode: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
        complexity: 0,
        functions: 0,
        classes: 0,
      },
      aiDetection: {
        isLikelyAI: false,
        confidence: 50,
        indicators: [],
      },
    };
  }
  
  const metrics = calculateMetrics(code, language);
  const issues = detectIssues(code, language);
  const aiDetection = detectAIGeneration(code, language);
  
  // Calculate score based on issues and metrics
  let score = 100;
  
  // Deduct points for issues
  issues.forEach(issue => {
    if (issue.type === 'critical') score -= 15;
    else if (issue.type === 'warning') score -= 8;
    else if (issue.type === 'info') score -= 3;
  });
  
  // Adjust for complexity
  if (metrics.complexity > 15) score -= 10;
  else if (metrics.complexity > 10) score -= 5;
  
  // Adjust for documentation
  const docRatio = metrics.commentLines / metrics.codeLines;
  if (docRatio < 0.05) score -= 5;
  else if (docRatio > 0.1) score += 5;
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    score: Math.round(score),
    issues,
    metrics,
    aiDetection,
  };
}
