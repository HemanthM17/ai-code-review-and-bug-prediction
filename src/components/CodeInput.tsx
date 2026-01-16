import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Code, Sparkles, AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { detectLanguageFromCode, getLanguageLabel } from "@/utils/languageDetection";

interface CodeInputProps {
  onAnalyze: (code: string, language: string) => void;
  onCodeChange?: (code: string, language: string) => void;
  demoCode?: string;
  demoLanguage?: string;
  disabled?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extensions: [".js", ".jsx"] },
  { value: "typescript", label: "TypeScript", extensions: [".ts", ".tsx"] },
  { value: "python", label: "Python", extensions: [".py"] },
  { value: "java", label: "Java", extensions: [".java"] },
  { value: "cpp", label: "C++", extensions: [".cpp", ".cc", ".cxx"] },
  { value: "c", label: "C", extensions: [".c", ".h"] },
  { value: "csharp", label: "C#", extensions: [".cs"] },
  { value: "go", label: "Go", extensions: [".go"] },
  { value: "rust", label: "Rust", extensions: [".rs"] },
  { value: "php", label: "PHP", extensions: [".php"] },
  { value: "ruby", label: "Ruby", extensions: [".rb"] },
  { value: "swift", label: "Swift", extensions: [".swift"] },
  { value: "kotlin", label: "Kotlin", extensions: [".kt"] },
  { value: "html", label: "HTML", extensions: [".html", ".htm"] },
  { value: "css", label: "CSS", extensions: [".css", ".scss", ".sass"] },
  { value: "sql", label: "SQL", extensions: [".sql"] },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LINES = 50000;
const MAX_CHARS = 500000;

export const CodeInput = ({ onAnalyze, onCodeChange, demoCode, demoLanguage, disabled = false }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Update code and language when demo is loaded
  useEffect(() => {
    if (demoCode) {
      setCode(demoCode);
      if (demoLanguage) {
        setLanguage(demoLanguage);
      }
    }
  }, [demoCode, demoLanguage]);

  // Notify parent when code or language changes
  useEffect(() => {
    onCodeChange?.(code, language);
  }, [code, language, onCodeChange]);

  // Detect language from code content
  const detectionResult = useMemo(() => {
    if (code.trim().length < 20) return null;
    return detectLanguageFromCode(code);
  }, [code]);

  // Check if there's a mismatch
  const languageMismatch = useMemo(() => {
    if (!detectionResult || detectionResult.confidence < 40) return null;
    if (detectionResult.detectedLanguage !== language) {
      return {
        detected: detectionResult.detectedLanguage,
        selected: language,
        confidence: detectionResult.confidence,
      };
    }
    return null;
  }, [detectionResult, language]);

  const detectLanguageFromFile = (filename: string): string => {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang.extensions.includes(ext)) {
        return lang.value;
      }
    }
    return "javascript";
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to analyze");
      return;
    }

    const lines = code.split('\n').length;
    if (lines > MAX_LINES) {
      toast.error(`Code exceeds maximum line limit of ${MAX_LINES.toLocaleString()} lines`);
      return;
    }

    if (code.length > MAX_CHARS) {
      toast.error(`Code exceeds maximum character limit of ${MAX_CHARS.toLocaleString()} characters`);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      onAnalyze(code, language);
      setIsAnalyzing(false);
      toast.success("Analysis complete!");
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File size exceeds maximum limit of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
        e.target.value = ''; // Reset input
        return;
      }

      const detectedLang = detectLanguageFromFile(file.name);
      setLanguage(detectedLang);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        // Validate content size
        const lines = content.split('\n').length;
        if (lines > MAX_LINES) {
          toast.error(`File exceeds maximum line limit of ${MAX_LINES.toLocaleString()} lines`);
          e.target.value = '';
          return;
        }

        if (content.length > MAX_CHARS) {
          toast.error(`File exceeds maximum character limit of ${MAX_CHARS.toLocaleString()} characters`);
          e.target.value = '';
          return;
        }

        setCode(content);
        toast.success(`File "${file.name}" loaded successfully (${SUPPORTED_LANGUAGES.find(l => l.value === detectedLang)?.label})`);
      };
      reader.onerror = () => {
        toast.error("Failed to read file. Please try again.");
      };
      reader.readAsText(file);
    }
  };

  const handleUseDetectedLanguage = () => {
    if (languageMismatch) {
      setLanguage(languageMismatch.detected);
      toast.success(`Language changed to ${getLanguageLabel(languageMismatch.detected)}`);
    }
  };

  const lines = code.split('\n').length;
  const chars = code.length;
  const isNearLineLimit = lines > MAX_LINES * 0.9;
  const isNearCharLimit = chars > MAX_CHARS * 0.9;

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-5xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="space-y-6">
          {/* Limitations Alert */}
          <Alert className="border-muted">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Limits:</strong> Maximum {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB file size • {MAX_LINES.toLocaleString()} lines • {MAX_CHARS.toLocaleString()} characters
            </AlertDescription>
          </Alert>

          {/* Language Mismatch Warning */}
          {languageMismatch && (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm flex items-center justify-between">
                <span>
                  <strong>Language mismatch detected!</strong> The code appears to be{" "}
                  <span className="font-semibold text-primary">{getLanguageLabel(languageMismatch.detected)}</span>{" "}
                  ({languageMismatch.confidence}% confidence) but you selected{" "}
                  <span className="font-semibold text-destructive">{getLanguageLabel(languageMismatch.selected)}</span>.
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUseDetectedLanguage}
                  className="ml-4 shrink-0"
                >
                  Use {getLanguageLabel(languageMismatch.detected)}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Language Match Confirmation */}
          {detectionResult && !languageMismatch && detectionResult.confidence >= 40 && code.trim().length >= 20 && (
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-sm">
                <strong>Language verified!</strong> Code detected as{" "}
                <span className="font-semibold text-success">{getLanguageLabel(detectionResult.detectedLanguage)}</span>{" "}
                ({detectionResult.confidence}% confidence) — matches your selection.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <Code className="w-8 h-8 text-primary" />
                  Code Analysis
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-muted-foreground">
                    Paste your code or upload a file to get started
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {SUPPORTED_LANGUAGES.length}+ Languages Supported
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.swift,.kt,.html,.css,.scss,.cs,.sql,.h,.cc,.cxx"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="secondary"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Selected Language: <span className="text-primary font-medium">{SUPPORTED_LANGUAGES.find(l => l.value === language)?.label}</span>
                {detectionResult && detectionResult.confidence >= 40 && code.trim().length >= 20 && (
                  <span className="ml-3 text-muted-foreground/70">
                    • Detected: <span className={detectionResult.detectedLanguage === language ? "text-success" : "text-warning"}>
                      {getLanguageLabel(detectionResult.detectedLanguage)}
                    </span>
                  </span>
                )}
              </span>
            </div>
            <Textarea
              placeholder={`// Paste your ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label} code here...
${language === 'python' ? `def calculate_total(items):
    total = 0
    for item in items:
        total += item['price']
    return total` : 
language === 'java' ? `public int calculateTotal(List<Item> items) {
    int total = 0;
    for (Item item : items) {
        total += item.getPrice();
    }
    return total;
}` :
language === 'html' ? `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>` :
language === 'css' ? `.container {
    display: flex;
    justify-content: center;
    align-items: center;
}` :
`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[400px] font-mono text-sm bg-secondary/50 border-border/50"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isNearLineLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {lines.toLocaleString()} / {MAX_LINES.toLocaleString()} lines
              </span>
              <span className={`text-sm ${isNearCharLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
              </span>
              {(isNearLineLimit || isNearCharLimit) && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  Approaching limit
                </span>
              )}
            </div>
            
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || disabled}
              className="bg-gradient-primary text-primary-foreground shadow-glow-primary"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
};
