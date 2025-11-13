import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startupName: text("startup_name").notNull(),
  foundedYear: integer("founded_year").notNull(),
  teamSize: integer("team_size").notNull(),
  marketCategory: text("market_category").notNull(),
  location: text("location").notNull(),
  fundingAmount: real("funding_amount").notNull(),
  description: text("description").notNull(),
  successProbability: real("success_probability").notNull(),
  sentiment: text("sentiment").notNull(),
  sentimentScore: real("sentiment_score").notNull(),
  featureImportance: text("feature_importance").notNull(),
  improvements: text("improvements").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const createPredictionInputSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  foundedYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  teamSize: z.coerce.number().int().min(1).max(10000),
  marketCategory: z.string().min(1, "Market category is required"),
  location: z.string().min(1, "Location is required"),
  fundingAmount: z.coerce.number().min(0),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type CreatePredictionInput = z.infer<typeof createPredictionInputSchema>;

export interface PredictionResult {
  id: string;
  startupName: string;
  foundedYear: number;
  teamSize: number;
  marketCategory: string;
  location: string;
  fundingAmount: number;
  description: string;
  successProbability: number;
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number;
  featureImportance: FeatureImportance[];
  improvements: string[];
  createdAt: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  displayName: string;
}
