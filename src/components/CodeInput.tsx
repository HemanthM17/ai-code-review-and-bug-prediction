import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, Code, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CodeInputProps {
  onAnalyze: (code: string) => void;
}

export const CodeInput = ({ onAnalyze }: CodeInputProps) => {
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        toast.success(`File "${file.name}" loaded successfully`);
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
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Code className="w-8 h-8 text-primary" />
                Code Analysis
              </h2>
              <p className="text-muted-foreground">
                Paste your code or upload a file to get started
              </p>
            </div>
            
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs"
                onChange={handleFileUpload}
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </div>
          </div>

          <Textarea
            placeholder="// Paste your code here...
function calculateTotal(items) {
  let total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[400px] font-mono text-sm bg-secondary/50 border-border/50"
          />

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
