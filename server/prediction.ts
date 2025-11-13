import type { CreatePredictionInput, FeatureImportance } from "@shared/schema";

export function calculateSuccessProbability(data: CreatePredictionInput, sentimentScore: number): number {
  const currentYear = new Date().getFullYear();
  const companyAge = currentYear - data.foundedYear;

  const fundingScore = Math.min(data.fundingAmount / 10000000, 1) * 100;
  const teamSizeScore = Math.min(data.teamSize / 50, 1) * 100;
  const ageScore = Math.min(companyAge / 10, 1) * 100;
  const sentimentScoreNormalized = sentimentScore * 100;

  const categoryMultipliers: Record<string, number> = {
    "AI/ML": 1.2,
    "FinTech": 1.15,
    "HealthTech": 1.1,
    "SaaS": 1.1,
    "Software": 1.05,
    "E-commerce": 1.0,
    "EdTech": 1.0,
    "Blockchain": 0.95,
    "Mobile Apps": 0.9,
    "Gaming": 0.85,
    "Other": 0.9,
  };

  const locationMultipliers: Record<string, number> = {
    "North America": 1.1,
    "Europe": 1.05,
    "Asia": 1.0,
    "Oceania": 0.95,
    "South America": 0.9,
    "Africa": 0.85,
  };

  const categoryMultiplier = categoryMultipliers[data.marketCategory] || 1.0;
  const locationMultiplier = locationMultipliers[data.location] || 1.0;

  let baseScore = (
    fundingScore * 0.35 +
    teamSizeScore * 0.2 +
    ageScore * 0.15 +
    sentimentScoreNormalized * 0.3
  );

  baseScore = baseScore * categoryMultiplier * locationMultiplier;

  const randomVariation = (Math.random() - 0.5) * 10;
  const finalScore = Math.max(5, Math.min(95, baseScore + randomVariation));

  return finalScore;
}

export function calculateFeatureImportance(
  data: CreatePredictionInput,
  sentimentScore: number
): FeatureImportance[] {
  const currentYear = new Date().getFullYear();
  const companyAge = currentYear - data.foundedYear;

  const fundingImportance = Math.min((data.fundingAmount / 10000000) * 100, 100);
  const teamSizeImportance = Math.min((data.teamSize / 50) * 100, 100);
  const ageImportance = Math.min((companyAge / 10) * 100, 100);
  const sentimentImportance = sentimentScore * 100;

  const features: FeatureImportance[] = [
    {
      feature: "funding_total_usd",
      displayName: "Funding",
      importance: fundingImportance,
    },
    {
      feature: "company_age",
      displayName: "Company Age",
      importance: ageImportance,
    },
    {
      feature: "team_size",
      displayName: "Team Size",
      importance: teamSizeImportance,
    },
    {
      feature: "sentiment",
      displayName: "Sentiment",
      importance: sentimentImportance,
    },
    {
      feature: "market_category",
      displayName: "Market",
      importance: 70 + Math.random() * 20,
    },
  ];

  return features.sort((a, b) => b.importance - a.importance);
}
