import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, AlertTriangle, GitBranch, Shield, Zap } from "lucide-react";
import type { CICDAnalysisResult } from "@/utils/cicdAnalysis";

interface CICDAnalysisProps {
  result: CICDAnalysisResult;
}

export const CICDAnalysis = ({ result }: CICDAnalysisProps) => {
  if (!result.detected) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="card-gradient border-info/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="w-8 h-8 text-info" />
            <div>
              <CardTitle>CI/CD Pipeline Analysis</CardTitle>
              <CardDescription>Detected: {result.platform}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {result.platform}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Security Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-info" />
              <span className="font-medium">Pipeline Security Score</span>
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(result.securityScore)}`}>
              {result.securityScore}%
            </span>
          </div>
          <Progress value={result.securityScore} className="h-3" />
        </div>

        {/* Issues */}
        {result.issues.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Pipeline Issues ({result.issues.length})
            </h4>
            <div className="space-y-3">
              {result.issues.map((issue, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    issue.type === 'critical' 
                      ? 'border-destructive/50 bg-destructive/5' 
                      : issue.type === 'warning'
                      ? 'border-warning/50 bg-warning/5'
                      : 'border-info/50 bg-info/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {issue.type === 'critical' ? (
                      <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{issue.title}</h5>
                        <Badge variant={issue.type === 'critical' ? 'destructive' : 'secondary'}>
                          {issue.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <div className="p-3 bg-secondary/30 rounded border border-border/30">
                        <p className="text-sm text-muted-foreground">
                          <strong>Fix:</strong> {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Practices Checklist */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Best Practices Checklist
          </h4>
          <div className="grid gap-3">
            {result.bestPractices.map((practice, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
              >
                {practice.implemented ? (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${practice.implemented ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {practice.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{practice.description}</p>
                </div>
                <Badge variant={practice.implemented ? 'default' : 'outline'}>
                  {practice.implemented ? 'Implemented' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
