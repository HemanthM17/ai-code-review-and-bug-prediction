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
    issues.push({
      type: 'critical',
      title: 'Dangerous eval() usage',
      description: 'Using eval() can execute arbitrary code and is a serious security risk.',
      suggestion: 'Replace eval() with safer alternatives like JSON.parse() or Function constructor with strict validation.',
    });
  }
  
  if (/innerHTML\s*=/i.test(code) && !/<[^>]+>/i.test(code)) {
    issues.push({
      type: 'warning',
      title: 'Potential XSS vulnerability',
      description: 'Direct innerHTML assignment can lead to XSS attacks.',
      suggestion: 'Use textContent, or sanitize HTML content before insertion.',
    });
  }
  
  // SQL Injection patterns
  if (/(SELECT|INSERT|UPDATE|DELETE).*\+.*['"]/.test(code)) {
    issues.push({
      type: 'critical',
      title: 'Potential SQL Injection',
      description: 'String concatenation in SQL queries can lead to SQL injection.',
      suggestion: 'Use parameterized queries or prepared statements.',
    });
  }
  
  // Code quality issues
  const consoleCount = (code.match(/console\.(log|error|warn)/g) || []).length;
  if (consoleCount > 5) {
    issues.push({
      type: 'warning',
      title: 'Excessive console statements',
      description: `Found ${consoleCount} console statements. This can impact performance and leak information.`,
      suggestion: 'Remove debug console statements or use a proper logging library.',
    });
  }
  
  const todoCount = (code.match(/TODO|FIXME|HACK/gi) || []).length;
  if (todoCount > 0) {
    issues.push({
      type: 'info',
      title: 'Unfinished work detected',
      description: `Found ${todoCount} TODO/FIXME comments indicating incomplete code.`,
      suggestion: 'Complete the pending tasks before production deployment.',
    });
  }
  
  // No error handling
  if (language.match(/javascript|typescript|python|java/) && 
      (code.match(/async|fetch|axios|request/i) && !code.match(/try|catch|except|throw/i))) {
    issues.push({
      type: 'warning',
      title: 'Missing error handling',
      description: 'Async operations without try-catch blocks can cause unhandled rejections.',
      suggestion: 'Add try-catch blocks around async operations.',
    });
  }
  
  // Hardcoded credentials
  if (/password\s*=\s*['"][^'"]+['"]|api[_-]?key\s*=\s*['"][^'"]+['"]/i.test(code)) {
    issues.push({
      type: 'critical',
      title: 'Hardcoded credentials detected',
      description: 'Credentials should never be hardcoded in source code.',
      suggestion: 'Use environment variables or secure credential management systems.',
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
  if (metrics.functions > 3 && metrics.commentLines < metrics.functions) {
    issues.push({
      type: 'info',
      title: 'Insufficient documentation',
      description: 'Low comment-to-code ratio detected.',
      suggestion: 'Add comments and documentation to improve code maintainability.',
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
