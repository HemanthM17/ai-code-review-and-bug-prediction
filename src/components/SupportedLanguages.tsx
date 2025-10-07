import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";

const LANGUAGES = [
  { name: "JavaScript", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { name: "TypeScript", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { name: "Python", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { name: "Java", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { name: "C++", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { name: "C", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { name: "C#", color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  { name: "Go", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { name: "Rust", color: "bg-orange-600/10 text-orange-600 border-orange-600/20" },
  { name: "PHP", color: "bg-indigo-600/10 text-indigo-600 border-indigo-600/20" },
  { name: "Ruby", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { name: "Swift", color: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
  { name: "Kotlin", color: "bg-purple-600/10 text-purple-600 border-purple-600/20" },
  { name: "HTML", color: "bg-red-400/10 text-red-400 border-red-400/20" },
  { name: "CSS", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  { name: "SQL", color: "bg-gray-400/10 text-gray-400 border-gray-400/20" },
];

export const SupportedLanguages = () => {
  return (
    <section className="container mx-auto px-4 py-16 bg-secondary/20">
      <Card className="max-w-5xl mx-auto p-8 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Code2 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Multi-Language Support</h2>
          </div>
          <p className="text-muted-foreground">
            Our AI-powered analysis works with all major programming languages
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            {LANGUAGES.map((lang) => (
              <Badge
                key={lang.name}
                variant="outline"
                className={`${lang.color} px-4 py-2 text-sm font-medium transition-all hover:scale-105`}
              >
                {lang.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};
