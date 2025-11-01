import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const PrivacyBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem("privacy-banner-seen");
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("privacy-banner-seen", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-primary-foreground p-4 shadow-lg animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[250px]">
          <Shield className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Your privacy matters.</strong> We don't store your code. All analysis is ephemeral and secure.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDismiss}
          className="flex items-center gap-2"
        >
          Got it
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
