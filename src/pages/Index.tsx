import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { SupportedLanguages } from "@/components/SupportedLanguages";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults } from "@/components/AnalysisResults";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [codeQualityScore, setCodeQualityScore] = useState(0);
  const codeInputRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    codeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAnalyze = (code: string) => {
    // Simulate code analysis and generate a score
    // In a real app, this would call a backend API
    const score = Math.floor(Math.random() * 30) + 65; // Random score between 65-95
    setCodeQualityScore(score);
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
      {showResults && <AnalysisResults score={codeQualityScore} />}
    </div>
  );
};

export default Index;
