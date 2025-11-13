import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, Lightbulb, Brain, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import type { PredictionResult } from "@shared/schema";

function CircularGauge({ value }: { value: number }) {
  const percentage = Math.round(value);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 75) return "hsl(var(--chart-1))";
    if (val >= 50) return "hsl(var(--chart-2))";
    if (val >= 25) return "hsl(var(--chart-4))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke={getColor(percentage)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color: getColor(percentage) }}>
          {percentage}%
        </div>
        <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
      </div>
    </div>
  );
}

function getSentimentColor(sentiment: string) {
  switch (sentiment) {
    case "Positive":
      return "text-chart-1 bg-chart-1/10 border-chart-1/20";
    case "Neutral":
      return "text-chart-4 bg-chart-4/10 border-chart-4/20";
    case "Negative":
      return "text-destructive bg-destructive/10 border-destructive/20";
    default:
      return "text-muted-foreground bg-muted border-muted";
  }
}

export default function Results() {
  const { id } = useParams();

  const { data: prediction, isLoading } = useQuery<PredictionResult>({
    queryKey: ["/api/predictions", id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-6">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Prediction Not Found</h1>
          <Link href="/predict">
            <Button data-testid="button-back-predict">
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Prediction
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back-history">
                <ArrowLeft className="w-4 h-4" />
                Back to History
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground" data-testid="text-startup-name">
              {prediction.startupName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Analysis completed on {new Date(prediction.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Link href="/predict">
            <Button className="gap-2" data-testid="button-new-prediction">
              <Brain className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Success Probability</CardTitle>
              <CardDescription className="text-center">
                AI-predicted success rate
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CircularGauge value={prediction.successProbability} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-medium" data-testid="text-team-size">{prediction.teamSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Founded</span>
                  <span className="font-medium">{prediction.foundedYear}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Company Age</span>
                  <span className="font-medium">{new Date().getFullYear() - prediction.foundedYear} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{prediction.marketCategory}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{prediction.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Funding</span>
                  <span className="font-medium">
                    ${(prediction.fundingAmount / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>Description sentiment score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-6">
                <Badge 
                  className={`text-lg px-6 py-2 ${getSentimentColor(prediction.sentiment)}`}
                  data-testid="badge-sentiment"
                >
                  {prediction.sentiment}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{Math.round(prediction.sentimentScore * 100)}%</span>
                </div>
                <Progress value={prediction.sentimentScore * 100} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                Based on NLP analysis of your startup description
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Feature Importance
            </CardTitle>
            <CardDescription>
              Impact of different factors on success prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prediction.featureImportance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayName" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
                <Bar dataKey="importance" radius={[8, 8, 0, 0]}>
                  {prediction.featureImportance.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              AI-Powered Improvement Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to increase success probability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {prediction.improvements.map((improvement, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-4 rounded-lg border bg-card hover-elevate"
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{improvement}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
