import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Download, Mail, Twitter, Linkedin, FileJson } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AnalysisResult } from "@/utils/codeAnalysis";
import type { CICDAnalysisResult } from "@/utils/cicdAnalysis";

interface ShareResultsProps {
  result: AnalysisResult;
  cicdResult?: CICDAnalysisResult;
}

export const ShareResults = ({ result, cicdResult }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);

  const generateShareableText = () => {
    const { score, issues, metrics, aiDetection } = result;
    const criticalCount = issues.filter(i => i.type === 'critical').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return `🔍 Code Analysis Report

📊 Quality Score: ${score}/100
📏 Lines of Code: ${metrics.linesOfCode}
🔄 Complexity: ${metrics.complexity}
📝 Functions: ${metrics.functions}

⚠️ Issues Found:
- Critical: ${criticalCount}
- Warnings: ${warningCount}
- Info: ${issues.length - criticalCount - warningCount}

🤖 AI Detection: ${aiDetection.isLikelyAI ? 'Possibly AI Generated' : 'Likely Human Written'} (${aiDetection.confidence}% confidence)

${cicdResult?.detected ? `\n🚀 CI/CD: ${cicdResult.platform} (Security: ${cicdResult.securityScore}%)` : ''}

Analyzed with AI Code Review Tool`;
  };

  const generateJSON = () => {
    return JSON.stringify({
      analysisResult: result,
      cicdAnalysis: cicdResult,
      timestamp: new Date().toISOString(),
    }, null, 2);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Analysis results have been copied.",
    });
  };

  const downloadJSON = () => {
    const json = generateJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Report downloaded",
      description: "JSON report has been saved.",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Code Analysis Report - Score: ${result.score}/100`);
    const body = encodeURIComponent(generateShareableText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `Just analyzed my code! 📊 Score: ${result.score}/100 | ${result.issues.length} issues found | Complexity: ${result.metrics.complexity}\n\n#CodeQuality #Programming`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`);
  };

  const shareViaLinkedIn = () => {
    const text = encodeURIComponent(
      `Performed a comprehensive code analysis:\n\n📊 Quality Score: ${result.score}/100\n📏 ${result.metrics.linesOfCode} lines analyzed\n⚠️ ${result.issues.length} issues identified\n\n#SoftwareEngineering #CodeReview #BestPractices`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
  };

  return (
    <Card className="card-gradient border-success/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Share2 className="w-8 h-8 text-success" />
          <div>
            <CardTitle>Share & Export Results</CardTitle>
            <CardDescription>
              Share your analysis results with your team or export for documentation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-3xl font-bold text-primary">{result.score}</p>
            <p className="text-sm text-muted-foreground">Quality Score</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-3xl font-bold text-warning">{result.issues.length}</p>
            <p className="text-sm text-muted-foreground">Issues Found</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-3xl font-bold text-info">{result.metrics.complexity}</p>
            <p className="text-sm text-muted-foreground">Complexity</p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-center">
            <p className="text-3xl font-bold text-success">{result.metrics.linesOfCode}</p>
            <p className="text-sm text-muted-foreground">Lines</p>
          </div>
        </div>

        {/* Copy Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold">Copy Summary</h4>
          <div className="relative">
            <Input 
              readOnly 
              value={`Score: ${result.score}/100 | ${result.issues.length} issues | ${result.metrics.linesOfCode} lines`}
              className="pr-20"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => copyToClipboard(generateShareableText())}
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <h4 className="font-semibold">Share Via</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={shareViaEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaTwitter} className="gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button variant="outline" onClick={shareViaLinkedIn} className="gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h4 className="font-semibold">Export</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadJSON} className="gap-2">
              <FileJson className="w-4 h-4" />
              Download JSON
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(generateJSON())} 
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy JSON
            </Button>
          </div>
        </div>

        {/* Team Collaboration Note */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Team Collaboration</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this analysis with your team to discuss code improvements and track quality over time. 
            Export the JSON report to integrate with your CI/CD pipeline or documentation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
