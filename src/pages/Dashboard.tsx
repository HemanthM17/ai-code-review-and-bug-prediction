import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analyzeCode, type AnalysisResult } from "@/utils/codeAnalysis";
import { Code2, Crown, FileCode, Shield, TrendingUp, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { profile, isPro } = useAuth();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('javascript');
  const [analysisCount, setAnalysisCount] = useState(0);
  const codeInputRef = useRef<HTMLDivElement>(null);

  const dailyLimit = isPro ? Infinity : 5;
  const canAnalyze = isPro || analysisCount < dailyLimit;

  const handleCodeChange = (code: string, language: string) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  };

  const handleAnalyze = (code: string, language: string) => {
    if (!canAnalyze) {
      navigate('/upgrade');
      return;
    }

    const result = analyzeCode(code, language);
    setAnalysisResult(result);
    setShowResults(true);
    setAnalysisCount(prev => prev + 1);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const stats = [
    {
      label: 'Analyses Today',
      value: analysisCount,
      max: isPro ? '∞' : dailyLimit,
      icon: FileCode,
    },
    {
      label: 'Plan',
      value: isPro ? 'Pro' : 'Free',
      icon: isPro ? Crown : Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.display_name || 'Developer'}!
          </h1>
          <p className="text-muted-foreground">
            Analyze your code and get AI-powered insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">
                      {stat.value}
                      {stat.max && <span className="text-muted-foreground font-normal">/{stat.max}</span>}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!isPro && (
            <Card className="border-primary/50 bg-primary/5 col-span-1 md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Upgrade to Pro</p>
                      <p className="text-sm text-muted-foreground">
                        Unlimited analyses, advanced AI features, and more
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/upgrade')} size="sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Usage Warning */}
        {!isPro && analysisCount >= dailyLimit && (
          <Card className="border-warning/50 bg-warning/10 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-foreground">Daily limit reached</p>
                  <p className="text-sm text-muted-foreground">
                    You've used all {dailyLimit} free analyses for today. Upgrade to Pro for unlimited access.
                  </p>
                </div>
                <Button onClick={() => navigate('/upgrade')} variant="outline" size="sm" className="ml-auto">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Analysis Section */}
        <Card className="border-border/50 bg-card/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Code Analysis
            </CardTitle>
            <CardDescription>
              Paste your code below to analyze for bugs, security issues, and get improvement suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div ref={codeInputRef}>
              <CodeInput
                onAnalyze={handleAnalyze}
                onCodeChange={handleCodeChange}
                demoCode=""
                demoLanguage=""
                disabled={!canAnalyze}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && analysisResult && (
          <AnalysisResults
            result={analysisResult}
            code={currentCode}
            language={currentLanguage}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
