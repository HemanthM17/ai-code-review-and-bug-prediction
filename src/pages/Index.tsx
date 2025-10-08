import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { SupportedLanguages } from "@/components/SupportedLanguages";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { analyzeCode, type AnalysisResult } from "@/utils/codeAnalysis";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [demoCode, setDemoCode] = useState<string>('');
  const [demoLanguage, setDemoLanguage] = useState<string>('');
  const codeInputRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    codeInputRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDemo = () => {
    const exampleCode = `function authenticateUser(username, password) {
  // TODO: Add input validation
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const result = eval("database.query('" + query + "')");
  
  console.log("User data:", result);
  console.log("Password:", password);
  document.getElementById('output').innerHTML = result.name;
  
  return result;
}`;
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
      <Hero onGetStarted={handleGetStarted} onViewDemo={handleViewDemo} />
      <SupportedLanguages />
      <div ref={codeInputRef}>
        <CodeInput onAnalyze={handleAnalyze} demoCode={demoCode} demoLanguage={demoLanguage} />
      </div>
      {showResults && analysisResult && <AnalysisResults result={analysisResult} />}
    </div>
  );
};

export default Index;
