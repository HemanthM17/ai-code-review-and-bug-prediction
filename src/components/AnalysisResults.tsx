import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, XCircle, CheckCircle, Info, TrendingUp, Bug, Shield } from "lucide-react";

interface Issue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  line?: number;
  suggestion: string;
}

interface AnalysisResultsProps {
  score: number;
}

export const AnalysisResults = ({ score }: AnalysisResultsProps) => {
  // Mock data for demonstration
  const issues: Issue[] = [
    {
      type: 'critical',
      title: 'Use of var instead of let/const',
      description: 'Variable declared with var has function scope, use let or const for block scope',
      line: 3,
      suggestion: 'Replace var with const or let for better scoping and immutability'
    },
    {
      type: 'warning',
      title: 'Missing error handling',
      description: 'Function does not handle potential errors from array operations',
      suggestion: 'Add try-catch block or validate inputs before processing'
    },
    {
      type: 'info',
      title: 'Consider using Array.reduce()',
      description: 'Loop can be simplified using functional programming approach',
      line: 4,
      suggestion: 'items.reduce((total, item) => total + item.price, 0)'
    }
  ];

  const metrics = {
    bugs: 1,
    vulnerabilities: 0,
    codeSmells: 2,
    security: 85,
    maintainability: 72,
    reliability: 78
  };

  return (
    <section className="container mx-auto px-4 py-16 animate-slide-up">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Score Overview */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Code Quality Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-bold text-primary">{score}</span>
                <span className="text-2xl text-muted-foreground pb-2">/100</span>
              </div>
              <Progress value={score} className="h-3" />
              <p className="text-muted-foreground">
                {score >= 80 ? 'Excellent code quality!' : score >= 60 ? 'Good, but room for improvement' : 'Needs significant improvements'}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <MetricCard icon={<Bug />} label="Bugs" value={metrics.bugs} color="destructive" />
              <MetricCard icon={<Shield />} label="Security" value={`${metrics.security}%`} color="success" />
              <MetricCard icon={<TrendingUp />} label="Maintainability" value={`${metrics.maintainability}%`} color="warning" />
            </div>
          </div>
        </Card>

        {/* Issues List */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Detected Issues</h3>
          {issues.map((issue, index) => (
            <IssueCard key={index} issue={issue} />
          ))}
        </div>

        {/* Improvements Section */}
        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-success" />
            Recommended Improvements
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Implement strict TypeScript types</p>
                <p className="text-sm text-muted-foreground">Add type annotations to catch errors at compile time</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Add unit tests for critical functions</p>
                <p className="text-sm text-muted-foreground">Test coverage will help prevent regressions</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Use ESLint with strict configuration</p>
                <p className="text-sm text-muted-foreground">Automated linting catches common mistakes early</p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
};

const IssueCard = ({ issue }: { issue: Issue }) => {
  const getIcon = () => {
    switch (issue.type) {
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getVariant = () => {
    switch (issue.type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
    }
  };

  const getBorderColor = () => {
    switch (issue.type) {
      case 'critical':
        return 'border-destructive/50 shadow-glow-destructive';
      case 'warning':
        return 'border-warning/50 shadow-glow-warning';
      case 'info':
        return 'border-primary/50';
    }
  };

  return (
    <Card className={`p-6 bg-card/50 backdrop-blur-sm ${getBorderColor()}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={issue.type === 'critical' ? 'text-destructive' : issue.type === 'warning' ? 'text-warning' : 'text-primary'}>
              {getIcon()}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
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
          <Badge variant={getVariant()}>{issue.type.toUpperCase()}</Badge>
        </div>
        
        <div className="pl-8 p-4 bg-secondary/30 rounded-lg border border-border/30">
          <p className="text-sm">
            <span className="font-medium text-primary">💡 Suggestion: </span>
            <span className="text-muted-foreground">{issue.suggestion}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

const MetricCard = ({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: 'success' | 'warning' | 'destructive';
}) => {
  const colorClasses = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30">
      <div className={`p-2 rounded-lg mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
};
