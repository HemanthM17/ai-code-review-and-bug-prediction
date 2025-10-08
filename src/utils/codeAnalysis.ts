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
  
  // Security issues
  if (/eval\s*\(/i.test(code)) {
    const evalLines = lines.map((line, idx) => line.match(/eval\s*\(/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Dangerous eval() usage detected',
      description: 'eval() executes arbitrary code and poses severe security risks including code injection attacks.',
      line: evalLines[0] as number,
      suggestion: 'Use JSON.parse() for JSON data, or implement a safe parser. If dynamic code execution is needed, use Function constructor with strict input validation and Content Security Policy.',
    });
  }
  
  if (/innerHTML\s*=/i.test(code)) {
    const innerHTMLLines = lines.map((line, idx) => line.match(/innerHTML\s*=/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'XSS vulnerability: Unsafe innerHTML usage',
      description: 'innerHTML assignment with user input can execute malicious scripts, leading to Cross-Site Scripting attacks.',
      line: innerHTMLLines[0] as number,
      suggestion: 'Use textContent for plain text. For HTML, sanitize with DOMPurify library or use createElement() with setAttribute(). Example: element.textContent = userInput;',
    });
  }
  
  // SQL Injection patterns
  if (/(SELECT|INSERT|UPDATE|DELETE).*(\+|concat).*['"`]/i.test(code)) {
    const sqlLines = lines.map((line, idx) => 
      line.match(/(SELECT|INSERT|UPDATE|DELETE).*(\+|concat).*['"`]/i) ? idx + 1 : null
    ).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'SQL Injection vulnerability detected',
      description: 'String concatenation in SQL queries allows attackers to inject malicious SQL code, potentially exposing or destroying your database.',
      line: sqlLines[0] as number,
      suggestion: language.match(/javascript|typescript/) 
        ? 'Use parameterized queries: db.query("SELECT * FROM users WHERE id = ?", [userId]) or ORM methods like User.findOne({ id })'
        : 'Use prepared statements with bound parameters. Never concatenate user input into SQL strings.',
    });
  }
  
  // Code quality issues
  const consoleCount = (code.match(/console\.(log|error|warn|debug)/g) || []).length;
  if (consoleCount > 3) {
    issues.push({
      type: 'warning',
      title: `Excessive debugging: ${consoleCount} console statements found`,
      description: 'Console statements in production code can expose sensitive data, impact performance, and clutter browser console.',
      suggestion: language.match(/javascript|typescript/)
        ? 'Remove console.log statements before deployment. Consider using a logger like Winston or Pino with environment-based log levels.'
        : 'Remove print/debug statements. Use a proper logging framework with configurable log levels for production.',
    });
  }
  
  const todoCount = (code.match(/TODO|FIXME|HACK|XXX/gi) || []).length;
  if (todoCount > 0) {
    const todoLines = lines.map((line, idx) => line.match(/TODO|FIXME|HACK|XXX/i) ? idx + 1 : null).filter(Boolean);
    issues.push({
      type: 'info',
      title: `${todoCount} incomplete task${todoCount > 1 ? 's' : ''} found`,
      description: `Found ${todoCount} TODO/FIXME/HACK comment(s) indicating unfinished functionality or temporary workarounds.`,
      line: todoLines[0] as number,
      suggestion: 'Address all TODO items before deploying to production. Create tickets for tracking and assign owners for each pending task.',
    });
  }
  
  // No error handling
  if (language.match(/javascript|typescript|python|java/) && 
      (code.match(/async|await|fetch|axios|request|Promise/i) && !code.match(/try|catch|except|throw|\.catch\(/i))) {
    issues.push({
      type: 'warning',
      title: 'Missing error handling for async operations',
      description: 'Async/await or Promise-based code without error handling can cause unhandled rejections, crashing your application or leaving it in an inconsistent state.',
      suggestion: language.match(/javascript|typescript/)
        ? 'Wrap async code in try-catch blocks: try { const result = await fetch(url); } catch (error) { console.error("Failed:", error); } or use .catch() for Promises.'
        : 'Add try-except blocks around async operations to handle errors gracefully.',
    });
  }
  
  // Hardcoded credentials
  if (/password\s*=\s*['"][^'"]+['"]|api[_-]?key\s*=\s*['"][^'"]+['"]|secret\s*=\s*['"][^'"]+['"]/i.test(code)) {
    const credLines = lines.map((line, idx) => 
      line.match(/password\s*=\s*['"][^'"]+['"]|api[_-]?key\s*=\s*['"][^'"]+['"]|secret\s*=\s*['"][^'"]+['"]/i) ? idx + 1 : null
    ).filter(Boolean);
    issues.push({
      type: 'critical',
      title: 'Security breach: Hardcoded credentials found',
      description: 'Hardcoded passwords, API keys, or secrets in source code will be exposed in version control and can be discovered by attackers.',
      line: credLines[0] as number,
      suggestion: 'Store credentials in environment variables (.env file) and use process.env.API_KEY or similar. Never commit .env files. Use secret management services like AWS Secrets Manager or Azure Key Vault for production.',
    });
  }
  
  // Long functions
  let currentFunction = '';
  let functionLineCount = 0;
  lines.forEach((line, idx) => {
    if (/function|def|=>/.test(line)) {
      currentFunction = line.trim().substring(0, 50);
      functionLineCount = 0;
    } else if (line.trim() === '}' && functionLineCount > 50) {
      issues.push({
        type: 'info',
        title: 'Long function detected',
        description: `Function around line ${idx} has ${functionLineCount} lines.`,
        suggestion: 'Consider breaking down large functions into smaller, reusable functions.',
      });
    }
    functionLineCount++;
  });
  
  // Missing documentation
  const metrics = calculateMetrics(code, language);
  const commentRatio = metrics.commentLines / (metrics.codeLines || 1);
  if (metrics.functions > 3 && commentRatio < 0.1) {
    issues.push({
      type: 'info',
      title: 'Insufficient code documentation',
      description: `Found ${metrics.functions} functions but only ${metrics.commentLines} comment lines. Undocumented code is harder to maintain and understand.`,
      suggestion: 'Add JSDoc/docstring comments for each function explaining parameters, return values, and purpose. Example: /** @param {string} id - User ID @returns {User} User object */',
    });
  }
  
  return issues;
}

function detectAIGeneration(code: string, language: string): AIDetectionResult {
  const indicators: Array<{ type: 'ai' | 'human'; text: string }> = [];
  let aiScore = 0;
  let humanScore = 0;
  
  // Check for overly perfect formatting
  const lines = code.split('\n');
  const perfectIndentation = lines.filter(line => {
    const spaces = line.match(/^\s*/)?.[0].length || 0;
    return spaces % 2 === 0 || spaces % 4 === 0;
  }).length;
  
  if (perfectIndentation / lines.length > 0.9) {
    aiScore += 15;
    indicators.push({ type: 'ai', text: 'Consistent, perfect indentation throughout' });
  } else {
    humanScore += 10;
    indicators.push({ type: 'human', text: 'Inconsistent formatting patterns' });
  }
  
  // Check for generic variable names
  const genericNames = /\b(data|result|response|item|value|temp|tmp|foo|bar|obj)\b/g;
  const genericCount = (code.match(genericNames) || []).length;
  if (genericCount > 5) {
    aiScore += 20;
    indicators.push({ type: 'ai', text: 'Excessive use of generic variable names' });
  }
  
  // Check for comprehensive comments
  const commentRatio = code.split('\n').filter(l => l.trim().startsWith('//') || l.trim().startsWith('#')).length / lines.length;
  if (commentRatio > 0.2) {
    aiScore += 15;
    indicators.push({ type: 'ai', text: 'High comment-to-code ratio with formal documentation' });
  } else if (commentRatio > 0 && commentRatio < 0.1) {
    humanScore += 10;
    indicators.push({ type: 'human', text: 'Minimal, practical comments' });
  }
  
  // Check for TODO/FIXME (human trait)
  if (/TODO|FIXME|HACK|XXX/i.test(code)) {
    humanScore += 20;
    indicators.push({ type: 'human', text: 'Contains TODO/FIXME comments' });
  }
  
  // Check for console.log debugging (human trait)
  const debugStatements = (code.match(/console\.(log|debug)|print\(|println\(/g) || []).length;
  if (debugStatements > 2) {
    humanScore += 15;
    indicators.push({ type: 'human', text: 'Debug statements present' });
  }
  
  // Check for repetitive patterns (AI trait)
  const repeatedPatterns = code.match(/(.{20,})\1{2,}/g);
  if (repeatedPatterns && repeatedPatterns.length > 0) {
    aiScore += 10;
    indicators.push({ type: 'ai', text: 'Highly repetitive code structures' });
  }
  
  // Check for verbose naming (AI trait)
  const longNames = code.match(/\b[a-z][a-zA-Z]{15,}\b/g);
  if (longNames && longNames.length > 3) {
    aiScore += 10;
    indicators.push({ type: 'ai', text: 'Verbose, descriptive naming conventions' });
  }
  
  // Check for personal style quirks (human trait)
  if (/\b(lol|wtf|damn|shit)\b/i.test(code)) {
    humanScore += 25;
    indicators.push({ type: 'human', text: 'Informal language in comments' });
  }
  
  // Unusual spacing patterns (human trait)
  if (/\(\s{2,}|\s{2,}\)|\{\s{2,}|\s{2,}\}/.test(code)) {
    humanScore += 10;
    indicators.push({ type: 'human', text: 'Irregular spacing patterns' });
  }
  
  const totalScore = aiScore + humanScore;
  const aiConfidence = totalScore > 0 ? (aiScore / totalScore) * 100 : 50;
  
  return {
    isLikelyAI: aiConfidence > 60,
    confidence: Math.round(aiConfidence),
    indicators: indicators.slice(0, 5),
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
