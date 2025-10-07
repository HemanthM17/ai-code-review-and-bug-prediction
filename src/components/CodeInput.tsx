import { useState } from "react";
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
import { Upload, Code, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CodeInputProps {
  onAnalyze: (code: string) => void;
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

export const CodeInput = ({ onAnalyze }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const detectLanguage = (filename: string): string => {
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

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      onAnalyze(code);
      setIsAnalyzing(false);
      toast.success("Analysis complete!");
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const detectedLang = detectLanguage(file.name);
      setLanguage(detectedLang);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        toast.success(`File "${file.name}" loaded successfully (${SUPPORTED_LANGUAGES.find(l => l.value === detectedLang)?.label})`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="max-w-5xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="space-y-6">
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
            <span className="text-sm text-muted-foreground">
              {code.split('\n').length} lines • {code.length} characters
            </span>
            
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
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
