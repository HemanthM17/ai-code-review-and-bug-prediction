import { Button } from "@/components/ui/button";
import { Code2, Shield, TrendingUp, Zap, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = ({ onGetStarted, onViewDemo }: { onGetStarted: () => void; onViewDemo: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by Advanced AI Models</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI Code Review
            </span>
            <br />
            <span className="text-foreground">& Bug Prediction</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze your code instantly. Detect bugs, vulnerabilities, and bad practices. 
            Get AI-powered suggestions to improve code quality across 16+ programming languages.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            {user ? (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-primary text-primary-foreground shadow-glow-primary hover:scale-105 transition-transform"
                >
                  <Code2 className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={onGetStarted}
                  className="backdrop-blur-sm"
                >
                  Quick Analysis
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-primary text-primary-foreground shadow-glow-primary hover:scale-105 transition-transform"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Start
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={onViewDemo}
                  className="backdrop-blur-sm"
                >
                  View Demo
                </Button>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Security Analysis"
              description="Detect vulnerabilities and security issues"
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6" />}
              title="Best Practices"
              description="Enforce coding standards and patterns"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Bug Prediction"
              description="Identify bug-prone code with ML"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all">
    <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
