import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3, Sparkles, Brain } from "lucide-react";
import heroImage from "@assets/generated_images/AI_business_data_hero_illustration_2ba0934c.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Startup Success Predictor
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                Powered by Machine Learning & NLP trained on Crunchbase data. Get instant AI-based predictions with comprehensive visual insights.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/predict" data-testid="link-start-prediction">
                  <Button size="lg" className="gap-2" data-testid="button-start-prediction">
                    <Brain className="w-5 h-5" />
                    Start Prediction
                  </Button>
                </Link>
                <Link href="/history" data-testid="link-view-results">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-view-results">
                    <BarChart3 className="w-5 h-5" />
                    View Past Results
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">84%</div>
                  <div className="text-sm text-muted-foreground">Avg. Accuracy</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Predictions</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Features</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI model analyzes multiple factors to predict your startup's success probability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Input Details</h3>
            <p className="text-muted-foreground">
              Enter your startup information including team size, funding, market category, and description
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI Analysis</h3>
            <p className="text-muted-foreground">
              Our ML model analyzes feature importance, sentiment, and predicts success probability
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover-elevate">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Get Insights</h3>
            <p className="text-muted-foreground">
              Receive detailed predictions, visualizations, and AI-powered improvement suggestions
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
