import { AlertCircle, CheckCircle2, Info, Bug, Shield, Gauge, Brain, User, Sparkles, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AnalysisResult, Issue } from "@/utils/codeAnalysis";
import { analyzeCICD, type CICDAnalysisResult } from "@/utils/cicdAnalysis";
import { ComplexityChart } from "./ComplexityChart";
import { CICDAnalysis } from "./CICDAnalysis";
import { AIFixSuggestions } from "./AIFixSuggestions";
import { ShareResults } from "./ShareResults";
import { useMemo } from "react";

interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  example?: string;
}

function generateRecommendations(result: AnalysisResult): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { issues, metrics, score } = result;
  
  // Critical security issues take priority
  const hasCriticalSecurity = issues.some(i => i.type === 'critical' && (i.title.includes('SQL') || i.title.includes('XSS') || i.title.includes('eval')));
  if (hasCriticalSecurity) {
    recommendations.push({
      title: '🚨 Address Critical Security Vulnerabilities First',
      description: 'Your code has critical security issues that could lead to data breaches or system compromise. These should be fixed before any other changes. Security vulnerabilities put your users, data, and reputation at risk.',
      priority: 'High',
      example: 'Review all critical issues above and implement the suggested fixes immediately.'
    });
  }
  
  // Hardcoded credentials
  const hasCredentials = issues.some(i => i.title.includes('credential'));
  if (hasCredentials) {
    recommendations.push({
      title: '🔐 Move Secrets to Environment Variables',
      description: 'Hardcoded API keys and passwords are visible to anyone with repository access and remain in Git history forever. Even if deleted later, they can be found. Use environment variables and secret management systems.',
      priority: 'High',
      example: 'Create a .env file, add it to .gitignore, and use process.env.API_KEY instead.'
    });
  }
  
  // Error handling
  const lacksErrorHandling = issues.some(i => i.title.includes('error handling'));
  if (lacksErrorHandling) {
    recommendations.push({
      title: '🛡️ Implement Robust Error Handling',
      description: 'Your async operations lack error handling, which can cause unexpected crashes and poor user experience. Wrap async calls in try-catch blocks and provide meaningful feedback to users when things go wrong.',
      priority: 'High',
      example: 'try { await fetchData(); } catch (error) { showErrorToast("Failed to load"); }'
    });
  }
  
  // High complexity
  if (metrics.complexity > 15) {
    recommendations.push({
      title: '🔄 Reduce Cyclomatic Complexity',
      description: `Your code has high complexity (${metrics.complexity}). Complex code is harder to test, debug, and maintain. Break down large functions, reduce nested conditions, and extract reusable logic into separate functions.`,
      priority: 'Medium',
      example: 'Split functions with many if/else branches into smaller, focused functions with clear names.'
    });
  }
  
  // Documentation
  const needsDocs = issues.some(i => i.title.includes('documentation'));
  if (needsDocs && metrics.functions > 3) {
    recommendations.push({
      title: '📚 Add Function Documentation',
      description: `You have ${metrics.functions} functions but minimal documentation. Future developers (including yourself) will struggle to understand the code. Add JSDoc/docstring comments explaining what each function does, its parameters, and return values.`,
      priority: 'Medium',
      example: '/** @param {string} id - User ID @returns {Promise<User>} User object */'
    });
  }
  
  // Console statements
  const hasConsole = issues.some(i => i.title.includes('console'));
  if (hasConsole) {
    recommendations.push({
      title: '🧹 Remove Debug Console Statements',
      description: 'Console statements left in production code can expose sensitive information and impact performance. Set up proper logging with environment-based levels, and use error tracking tools like Sentry.',
      priority: 'Medium',
      example: 'Replace console.log with a logger: logger.debug("only in dev") or remove entirely.'
    });
  }
  
  // TODO items
  const hasTodos = issues.some(i => i.title.includes('TODO') || i.title.includes('FIXME'));
  if (hasTodos) {
    recommendations.push({
      title: '✅ Complete or Track Pending Tasks',
      description: 'TODO comments indicate unfinished work. Either complete the tasks before deployment, or create proper tickets in your issue tracker (GitHub Issues, Jira, Linear) with assigned owners and deadlines.',
      priority: 'Low',
      example: 'Review each TODO: fix it, ticket it, or remove it if no longer relevant.'
    });
  }
  
  // Long functions
  const hasLongFunctions = issues.some(i => i.title.includes('Long function'));
  if (hasLongFunctions) {
    recommendations.push({
      title: '✂️ Break Down Large Functions',
      description: 'Long functions (50+ lines) violate the Single Responsibility Principle and are hard to test and understand. Extract logical sections into smaller, well-named helper functions that do one thing well.',
      priority: 'Low',
      example: 'Extract validation logic, formatting, and API calls into separate functions.'
    });
  }
  
  // General good practices if score is good
  if (score >= 80 && recommendations.length < 3) {
    recommendations.push({
      title: '🎯 Maintain Code Quality',
      description: 'Your code is in great shape! To keep it that way, consider setting up automated tools: ESLint/Prettier for formatting, Husky for pre-commit hooks, and Jest for unit tests. These catch issues before they reach production.',
      priority: 'Low',
      example: 'Add "npm run lint" to your CI/CD pipeline to enforce code quality.'
    });
  }
  
  // Add testing recommendation if not mentioned
  if (recommendations.length < 5 && !recommendations.some(r => r.title.includes('Test'))) {
    recommendations.push({
      title: '🧪 Write Unit Tests',
      description: 'Tests prevent regressions, document behavior, and give confidence when refactoring. Start with testing critical functions and edge cases. Aim for 70%+ coverage on business logic.',
      priority: 'Low',
      example: 'Use Jest, Vitest, or Pytest to test your functions. Focus on edge cases and error conditions.'
    });
  }
  
  return recommendations.slice(0, 5);
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  code?: string;
  language?: string;
}

export const AnalysisResults = ({ result, code = '', language = 'javascript' }: AnalysisResultsProps) => {
  const { score, issues, metrics, aiDetection } = result;
  
  // CI/CD Analysis
  const cicdResult = useMemo(() => analyzeCICD(code), [code]);
  
  // Issue breakdown for charts
  const issueBreakdown = useMemo(() => ({
    critical: issues.filter(i => i.type === 'critical').length,
    warning: issues.filter(i => i.type === 'warning').length,
    info: issues.filter(i => i.type === 'info').length,
  }), [issues]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <section className="container mx-auto px-4 py-16 space-y-8 animate-slide-up">
      {/* AI Detection Analysis */}
      <Card className="card-gradient border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>AI Detection Analysis</CardTitle>
                <CardDescription>Analyzing code authorship patterns</CardDescription>
              </div>
            </div>
            <Badge variant={aiDetection.isLikelyAI ? "secondary" : "default"} className="text-sm">
              {aiDetection.isLikelyAI ? "Possibly AI Generated" : "Likely Human"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-medium">Human Written</span>
                </div>
                <span className="text-2xl font-bold text-primary">{100 - aiDetection.confidence}%</span>
              </div>
              <Progress value={100 - aiDetection.confidence} className="h-3" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">AI Generated</span>
                </div>
                <span className="text-2xl font-bold text-muted-foreground">{aiDetection.confidence}%</span>
              </div>
              <Progress value={aiDetection.confidence} className="h-3 opacity-60" />
            </div>
          </div>

          {aiDetection.indicators.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Detection Indicators</h4>
              <div className="space-y-2">
                {aiDetection.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                    {indicator.type === 'human' ? (
                      <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Brain className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm text-muted-foreground">{indicator.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Overview */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-6 h-6" />
            Code Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Quality Score</span>
            <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
          <Progress value={score} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {getScoreLabel(score)} - {score >= 80 && "Excellent code quality! Keep up the good work."}
            {score >= 60 && score < 80 && "Good code quality with room for improvement."}
            {score >= 40 && score < 60 && "Fair code quality. Address the issues below."}
            {score < 40 && "Code quality needs significant attention. Review all issues carefully."}
          </p>

          <div className="pt-4 border-t border-border/50">
            <h3 className="font-semibold mb-4">Code Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard 
                icon={Gauge} 
                label="Lines of Code" 
                value={metrics.linesOfCode} 
                color="text-primary"
                tooltip="Total number of lines in your code, including comments and blank lines" 
              />
              <MetricCard 
                icon={Bug} 
                label="Complexity" 
                value={metrics.complexity} 
                color={metrics.complexity > 10 ? "text-warning" : "text-success"}
                tooltip="Cyclomatic complexity measures how many different paths exist through your code. Lower is better (aim for <10)"
              />
              <MetricCard 
                icon={CheckCircle2} 
                label="Functions" 
                value={metrics.functions} 
                color="text-info"
                tooltip="Number of functions or methods defined in your code"
              />
              <MetricCard 
                icon={Info} 
                label="Code Lines" 
                value={metrics.codeLines} 
                color="text-muted-foreground"
                tooltip="Lines of actual code, excluding comments and blank lines"
              />
              <MetricCard 
                icon={Shield} 
                label="Comment Lines" 
                value={metrics.commentLines} 
                color="text-success"
                tooltip="Number of comment lines. Good documentation improves code maintainability"
              />
              <MetricCard 
                icon={Gauge} 
                label="Classes" 
                value={metrics.classes} 
                color="text-primary"
                tooltip="Number of classes defined in your code (for object-oriented languages)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      {issues.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Detected Issues ({issues.length})
          </h3>
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="card-gradient border-success/50">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Issues Detected!</h3>
            <p className="text-muted-foreground">Your code looks great! No critical issues found.</p>
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      <Card className="card-gradient border-success/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Based on your code analysis, here's what we suggest working on next
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generateRecommendations(result).map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{rec.title}</p>
                    <Badge variant="outline" className="text-xs">{rec.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                  {rec.example && (
                    <div className="mt-2 p-3 bg-secondary/50 rounded border border-border/30">
                      <p className="text-xs font-mono text-muted-foreground">{rec.example}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Complexity Visualization */}
      <ComplexityChart metrics={metrics} issueBreakdown={issueBreakdown} />

      {/* CI/CD Pipeline Analysis */}
      {cicdResult.detected && <CICDAnalysis result={cicdResult} />}

      {/* AI-Powered Fix Suggestions */}
      <AIFixSuggestions code={code} language={language} issues={issues} />

      {/* Share & Collaboration */}
      <ShareResults result={result} cicdResult={cicdResult} />
    </section>
  );
};

const IssueCard = ({ issue }: { issue: Issue }) => {
  const getIcon = () => {
    switch (issue.type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <Info className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getBorderColor = () => {
    switch (issue.type) {
      case 'critical':
        return 'border-destructive/50';
      case 'warning':
        return 'border-warning/50';
      case 'info':
        return 'border-info/50';
    }
  };

  return (
    <Card className={`card-gradient ${getBorderColor()}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {getIcon()}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{issue.title}</h4>
                  {issue.line && (
                    <Badge variant="outline" className="text-xs">
                      Line {issue.line}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            </div>
            <Badge variant={issue.type === 'critical' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'default'}>
              {issue.type.toUpperCase()}
            </Badge>
          </div>
          
          <div className="pl-8 p-4 bg-secondary/30 rounded-lg border border-border/30 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-primary">How to Fix This</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{issue.suggestion}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, tooltip }: { icon: React.ElementType; label: string; value: string | number; color: string; tooltip: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30 border border-border/30 cursor-help hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-1 mb-2">
            <Icon className={`w-6 h-6 ${color}`} />
            <HelpCircle className="w-3 h-3 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
