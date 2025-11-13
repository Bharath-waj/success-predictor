import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ArrowLeftRight, Brain, History } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import type { PredictionResult } from "@shared/schema";

function getSentimentVariant(sentiment: string): "default" | "secondary" | "destructive" {
  switch (sentiment) {
    case "Positive":
      return "default";
    case "Neutral":
      return "secondary";
    case "Negative":
      return "destructive";
    default:
      return "secondary";
  }
}

function ComparisonView({ predictions }: { predictions: [PredictionResult, PredictionResult] }) {
  const [pred1, pred2] = predictions;

  const comparisonData = [
    {
      metric: "Success %",
      [pred1.startupName]: pred1.successProbability,
      [pred2.startupName]: pred2.successProbability,
    },
    {
      metric: "Sentiment",
      [pred1.startupName]: pred1.sentimentScore * 100,
      [pred2.startupName]: pred2.sentimentScore * 100,
    },
    {
      metric: "Team Size",
      [pred1.startupName]: Math.min(pred1.teamSize / 10, 100),
      [pred2.startupName]: Math.min(pred2.teamSize / 10, 100),
    },
    {
      metric: "Funding (M)",
      [pred1.startupName]: Math.min((pred1.fundingAmount / 1000000) * 10, 100),
      [pred2.startupName]: Math.min((pred2.fundingAmount / 1000000) * 10, 100),
    },
    {
      metric: "Age (years)",
      [pred1.startupName]: Math.min((new Date().getFullYear() - pred1.foundedYear) * 10, 100),
      [pred2.startupName]: Math.min((new Date().getFullYear() - pred2.foundedYear) * 10, 100),
    },
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Startup Comparison
        </CardTitle>
        <CardDescription>
          Side-by-side analysis of {pred1.startupName} vs {pred2.startupName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={comparisonData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                />
                <Radar
                  name={pred1.startupName}
                  dataKey={pred1.startupName}
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                />
                <Radar
                  name={pred2.startupName}
                  dataKey={pred2.startupName}
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {pred1.startupName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-chart-1">
                    {Math.round(pred1.successProbability)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <Badge variant={getSentimentVariant(pred1.sentiment)} className="mt-2">
                    {pred1.sentiment}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {pred2.startupName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-3xl font-bold text-chart-2">
                    {Math.round(pred2.successProbability)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <Badge variant={getSentimentVariant(pred2.sentiment)} className="mt-2">
                    {pred2.sentiment}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Team Size:</span>
                  <span className="ml-2 font-medium">{pred1.teamSize}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Team Size:</span>
                  <span className="ml-2 font-medium">{pred2.teamSize}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Funding:</span>
                  <span className="ml-2 font-medium">${(pred1.fundingAmount / 1000000).toFixed(2)}M</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Funding:</span>
                  <span className="ml-2 font-medium">${(pred2.fundingAmount / 1000000).toFixed(2)}M</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium">{pred1.marketCategory}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium">{pred2.marketCategory}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 font-medium">{pred1.location}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 font-medium">{pred2.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: predictions = [], isLoading } = useQuery<PredictionResult[]>({
    queryKey: ["/api/predictions"],
  });

  const handleCompareToggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      } else {
        return [prev[1], id];
      }
    });
  };

  const selectedPredictions = predictions.filter(p => selectedIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <History className="w-8 h-8 text-primary" />
              Analysis History
            </h1>
            <p className="text-muted-foreground mt-2">
              View and compare your previous startup predictions
            </p>
          </div>
          <Link href="/predict">
            <Button className="gap-2" data-testid="button-new-analysis">
              <Brain className="w-4 h-4" />
              New Analysis
            </Button>
          </Link>
        </div>

        {selectedIds.length === 2 && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedIds([])}
              data-testid="button-clear-comparison"
            >
              Clear Comparison
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Previous Analyses</CardTitle>
            <CardDescription>
              {predictions.length > 0 
                ? `${predictions.length} prediction${predictions.length !== 1 ? 's' : ''} saved`
                : "No predictions yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analyses Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by analyzing your first startup
                </p>
                <Link href="/predict">
                  <Button data-testid="button-start-first-analysis">
                    <Brain className="w-4 h-4 mr-2" />
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Startup Name</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((prediction) => (
                      <TableRow 
                        key={prediction.id}
                        className={selectedIds.includes(prediction.id) ? "bg-accent" : ""}
                        data-testid={`row-prediction-${prediction.id}`}
                      >
                        <TableCell className="font-medium" data-testid="text-prediction-name">
                          {prediction.startupName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold">
                              {Math.round(prediction.successProbability)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSentimentVariant(prediction.sentiment)}>
                            {prediction.sentiment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(prediction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/results/${prediction.id}`}>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                data-testid={`button-view-${prediction.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant={selectedIds.includes(prediction.id) ? "default" : "ghost"}
                              onClick={() => handleCompareToggle(prediction.id)}
                              disabled={selectedIds.length >= 2 && !selectedIds.includes(prediction.id)}
                              data-testid={`button-compare-${prediction.id}`}
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPredictions.length === 2 && (
          <ComparisonView predictions={selectedPredictions as [PredictionResult, PredictionResult]} />
        )}
      </div>
    </div>
  );
}
