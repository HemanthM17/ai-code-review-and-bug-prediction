import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { SupportedLanguages } from "@/components/SupportedLanguages";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Footer } from "@/components/Footer";
import { PrivacyBanner } from "@/components/PrivacyBanner";
// import { CodeHelpChat } from "@/components/CodeHelpChat";
import { analyzeCode, type AnalysisResult } from "@/utils/codeAnalysis";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [demoCode, setDemoCode] = useState<string>('');
  const [demoLanguage, setDemoLanguage] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('javascript');
  const codeInputRef = useRef<HTMLDivElement>(null);

  const handleCodeChange = (code: string, language: string) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  };

  const handleGetStarted = () => {
    codeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDemo = () => {
    const exampleCode = `function factorial(n) {
  if (n < 0) {
    return "Not defined for negative numbers";
  } else if (n = 0 || n === 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

const number = "5";
const result = factorial(number);
console.log(Factorial of \${number} is: \${result});

// TODO: Add input validation
const API_KEY = "sk_live_1234567890abcdef";`;
    setDemoCode(exampleCode);
    setDemoLanguage('javascript');
    
    // Scroll to code input section
    setTimeout(() => {
      codeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
      <Navigation />
      <Hero onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />
      <SupportedLanguages />
      <div ref={codeInputRef}>
        <CodeInput 
          onAnalyze={handleAnalyze} 
          onCodeChange={handleCodeChange}
          demoCode={demoCode} 
          demoLanguage={demoLanguage} 
        />
      </div>
      {showResults && analysisResult && (
        <AnalysisResults 
          result={analysisResult} 
          code={currentCode} 
          language={currentLanguage} 
        />
      )}
      <Footer />
      <PrivacyBanner />
      {/* <CodeHelpChat 
        code={currentCode} 
        language={currentLanguage} 
        analysisResult={analysisResult} 
      /> */}
    </div>
  );
};

export default Index;
