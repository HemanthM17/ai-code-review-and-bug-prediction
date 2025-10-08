import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { SupportedLanguages } from "@/components/SupportedLanguages";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { analyzeCode, type AnalysisResult } from "@/utils/codeAnalysis";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const codeInputRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    codeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = (code: string, language: string) => {
    // Perform actual code analysis
    const result = analyzeCode(code, language);
    setAnalysisResult(result);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onGetStarted={handleGetStarted} />
      <SupportedLanguages />
      <div ref={codeInputRef}>
        <CodeInput onAnalyze={handleAnalyze} />
      </div>
      {showResults && analysisResult && <AnalysisResults result={analysisResult} />}
    </div>
  );
};

export default Index;
