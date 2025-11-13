import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Home, History, TrendingUp } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:inline">Startup Predictor</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button 
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-home"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link href="/predict">
              <Button 
                variant={isActive("/predict") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-predict"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Predict</span>
              </Button>
            </Link>
            <Link href="/history">
              <Button 
                variant={isActive("/history") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-history"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
