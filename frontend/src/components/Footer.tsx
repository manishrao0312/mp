import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              StyleAI Virtual Try-On
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by AI. Built for fashion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
