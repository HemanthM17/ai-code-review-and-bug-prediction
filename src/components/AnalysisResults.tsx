import { AlertCircle, CheckCircle2, Info, Bug, Shield, Gauge, Brain, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AnalysisResult, Issue } from "@/utils/codeAnalysis";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  const { score, issues, metrics, aiDetection } = result;

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
              <MetricCard icon={Gauge} label="Lines of Code" value={metrics.linesOfCode} color="text-primary" />
              <MetricCard icon={Bug} label="Complexity" value={metrics.complexity} color={metrics.complexity > 10 ? "text-warning" : "text-success"} />
              <MetricCard icon={CheckCircle2} label="Functions" value={metrics.functions} color="text-info" />
              <MetricCard icon={Info} label="Code Lines" value={metrics.codeLines} color="text-muted-foreground" />
              <MetricCard icon={Shield} label="Comment Lines" value={metrics.commentLines} color="text-success" />
              <MetricCard icon={Gauge} label="Classes" value={metrics.classes} color="text-primary" />
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

      {/* Recommendations */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
            Recommended Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Add Comprehensive Documentation</p>
                <p className="text-sm text-muted-foreground">Document functions, classes, and complex logic</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Implement Error Handling</p>
                <p className="text-sm text-muted-foreground">Add try-catch blocks and input validation</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Write Unit Tests</p>
                <p className="text-sm text-muted-foreground">Increase test coverage to prevent bugs</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Follow Coding Standards</p>
                <p className="text-sm text-muted-foreground">Use linters and formatters for consistency</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
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
          
          <div className="pl-8 p-4 bg-secondary/30 rounded-lg border border-border/30">
            <p className="text-sm">
              <span className="font-medium text-primary">💡 Suggestion: </span>
              <span className="text-muted-foreground">{issue.suggestion}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) => (
  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30 border border-border/30">
    <Icon className={`w-6 h-6 mb-2 ${color}`} />
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
