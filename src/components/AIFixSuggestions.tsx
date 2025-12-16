import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check, Code, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Issue } from "@/utils/codeAnalysis";

interface AIFixSuggestionsProps {
  code: string;
  language: string;
  issues: Issue[];
}

interface AIFix {
  issue: string;
  fixedCode: string;
  explanation: string;
}

export const AIFixSuggestions = ({ code, language, issues }: AIFixSuggestionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fixes, setFixes] = useState<AIFix[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateFixes = async () => {
    if (issues.length === 0) {
      toast({
        title: "No issues to fix",
        description: "Your code looks great! No fixes needed.",
      });
      return;
    }

    setIsLoading(true);
    setFixes([]);

    try {
      const criticalIssues = issues.filter(i => i.type === 'critical').slice(0, 3);
      const warningIssues = issues.filter(i => i.type === 'warning').slice(0, 2);
      const selectedIssues = [...criticalIssues, ...warningIssues].slice(0, 5);

      const { data, error } = await supabase.functions.invoke('ai-fix-suggestions', {
        body: { 
          code, 
          language, 
          issues: selectedIssues.map(i => ({
            title: i.title,
            description: i.description,
            line: i.line,
            suggestion: i.suggestion,
          }))
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Usage limit reached",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setFixes(data.fixes || []);
      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.fixes?.length || 0} fix suggestions`,
      });
    } catch (error) {
      console.error('AI fix error:', error);
      toast({
        title: "Failed to generate fixes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Fixed code has been copied.",
    });
  };

  return (
    <Card className="card-gradient border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>AI-Powered Fix Suggestions</CardTitle>
              <CardDescription>
                Get intelligent code fixes for detected issues
              </CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateFixes} 
            disabled={isLoading || issues.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Fixes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">AI is analyzing your code and generating fixes...</p>
          </div>
        )}

        {!isLoading && fixes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Generate Fixes" to get AI-powered suggestions for fixing detected issues.</p>
            <p className="text-sm mt-2">The AI will analyze your code and provide specific fixes with explanations.</p>
          </div>
        )}

        {fixes.length > 0 && (
          <div className="space-y-6">
            {fixes.map((fix, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg bg-background/50 border border-border/50 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">{fix.issue}</h4>
                  </div>
                  <Badge variant="outline">Fix #{index + 1}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{fix.explanation}</p>
                
                <div className="relative">
                  <pre className="p-4 bg-secondary/50 rounded-lg overflow-x-auto text-sm">
                    <code>{fix.fixedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(fix.fixedCode, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
