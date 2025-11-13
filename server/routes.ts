import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createPredictionInputSchema, type PredictionResult, type FeatureImportance } from "@shared/schema";
import { analyzeSentiment, generateImprovementSuggestions } from "./openai";
import { calculateSuccessProbability, calculateFeatureImportance } from "./prediction";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/predictions", async (req, res) => {
    try {
      const validatedData = createPredictionInputSchema.parse(req.body);

      let sentimentAnalysis = { sentiment: "Neutral" as const, score: 0.5 };
      try {
        sentimentAnalysis = await analyzeSentiment(validatedData.description);
      } catch (error) {
        console.warn("Sentiment analysis failed, using fallback:", error);
      }
      
      const successProbability = calculateSuccessProbability(
        validatedData,
        sentimentAnalysis.score
      );

      const featureImportance = calculateFeatureImportance(
        validatedData,
        sentimentAnalysis.score
      );

      let improvements = [
        "Focus on customer acquisition and retention strategies to build a sustainable user base",
        "Optimize your product-market fit through continuous user feedback and iteration",
        "Build strategic partnerships to accelerate growth and expand market reach",
        "Develop scalable business processes to support rapid growth efficiently",
      ];
      
      try {
        improvements = await generateImprovementSuggestions({
          startupName: validatedData.startupName,
          teamSize: validatedData.teamSize,
          fundingAmount: validatedData.fundingAmount,
          marketCategory: validatedData.marketCategory,
          description: validatedData.description,
          successProbability,
          sentiment: sentimentAnalysis.sentiment,
        });
      } catch (error) {
        console.warn("AI improvement suggestions failed, using fallback:", error);
      }

      const prediction = await storage.createPrediction({
        startupName: validatedData.startupName,
        foundedYear: validatedData.foundedYear,
        teamSize: validatedData.teamSize,
        marketCategory: validatedData.marketCategory,
        location: validatedData.location,
        fundingAmount: validatedData.fundingAmount,
        description: validatedData.description,
        successProbability,
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score,
        featureImportance: JSON.stringify(featureImportance),
        improvements: JSON.stringify(improvements),
      });

      const result: PredictionResult = {
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment as "Positive" | "Neutral" | "Negative",
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance) as FeatureImportance[],
        improvements: JSON.parse(prediction.improvements) as string[],
        createdAt: prediction.createdAt.toISOString(),
      };

      res.json(result);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create prediction" 
      });
    }
  });

  app.get("/api/predictions/:id", async (req, res) => {
    try {
      const prediction = await storage.getPrediction(req.params.id);
      
      if (!prediction) {
        return res.status(404).json({ error: "Prediction not found" });
      }

      const result: PredictionResult = {
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment as "Positive" | "Neutral" | "Negative",
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance) as FeatureImportance[],
        improvements: JSON.parse(prediction.improvements) as string[],
        createdAt: prediction.createdAt.toISOString(),
      };

      res.json(result);
    } catch (error) {
      console.error("Get prediction error:", error);
      res.status(500).json({ error: "Failed to retrieve prediction" });
    }
  });

  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getAllPredictions();
      
      const results: PredictionResult[] = predictions.map(prediction => ({
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment as "Positive" | "Neutral" | "Negative",
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance) as FeatureImportance[],
        improvements: JSON.parse(prediction.improvements) as string[],
        createdAt: prediction.createdAt.toISOString(),
      }));

      res.json(results);
    } catch (error) {
      console.error("Get all predictions error:", error);
      res.status(500).json({ error: "Failed to retrieve predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
