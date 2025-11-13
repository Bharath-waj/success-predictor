// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  predictions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.predictions = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async createPrediction(insertPrediction) {
    const id = randomUUID();
    const prediction = {
      ...insertPrediction,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.predictions.set(id, prediction);
    return prediction;
  }
  async getPrediction(id) {
    return this.predictions.get(id);
  }
  async getAllPredictions() {
    return Array.from(this.predictions.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var predictions = pgTable("predictions", {
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
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true
});
var createPredictionInputSchema = z.object({
  startupName: z.string().min(1, "Startup name is required"),
  foundedYear: z.coerce.number().int().min(1900).max((/* @__PURE__ */ new Date()).getFullYear()),
  teamSize: z.coerce.number().int().min(1).max(1e4),
  marketCategory: z.string().min(1, "Market category is required"),
  location: z.string().min(1, "Location is required"),
  fundingAmount: z.coerce.number().min(0),
  description: z.string().min(10, "Description must be at least 10 characters")
});

// server/openai.ts
import "dotenv/config";
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function analyzeSentiment(text2) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of startup descriptions. Provide a sentiment classification (Positive, Neutral, or Negative) and a confidence score between 0 and 1. Respond with JSON in this format: { 'sentiment': string, 'score': number }"
        },
        {
          role: "user",
          content: text2
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      sentiment: result.sentiment || "Neutral",
      score: Math.max(0, Math.min(1, result.score || 0.5))
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return {
      sentiment: "Neutral",
      score: 0.5
    };
  }
}
async function generateImprovementSuggestions(data) {
  try {
    const prompt = `You are a startup consultant AI. Based on the following startup data, provide 4-6 specific, actionable improvement suggestions to increase their success probability. Be concise and practical.

Startup: ${data.startupName}
Team Size: ${data.teamSize}
Funding: $${(data.fundingAmount / 1e6).toFixed(2)}M
Market Category: ${data.marketCategory}
Current Success Probability: ${Math.round(data.successProbability)}%
Description Sentiment: ${data.sentiment}
Description: ${data.description}

Respond with JSON in this format: { "suggestions": ["suggestion 1", "suggestion 2", ...] }`;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a startup business consultant providing actionable advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [
      "Expand your team to cover critical skill gaps",
      "Increase market research to better understand customer needs",
      "Develop a stronger go-to-market strategy",
      "Build strategic partnerships to accelerate growth"
    ];
  } catch (error) {
    console.error("Improvement suggestions error:", error);
    return [
      "Focus on customer acquisition and retention strategies",
      "Optimize your product-market fit through user feedback",
      "Build a strong brand presence in your target market",
      "Develop scalable business processes"
    ];
  }
}

// server/prediction.ts
function calculateSuccessProbability(data, sentimentScore) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const companyAge = currentYear - data.foundedYear;
  const fundingScore = Math.min(data.fundingAmount / 1e7, 1) * 100;
  const teamSizeScore = Math.min(data.teamSize / 50, 1) * 100;
  const ageScore = Math.min(companyAge / 10, 1) * 100;
  const sentimentScoreNormalized = sentimentScore * 100;
  const categoryMultipliers = {
    "AI/ML": 1.2,
    "FinTech": 1.15,
    "HealthTech": 1.1,
    "SaaS": 1.1,
    "Software": 1.05,
    "E-commerce": 1,
    "EdTech": 1,
    "Blockchain": 0.95,
    "Mobile Apps": 0.9,
    "Gaming": 0.85,
    "Other": 0.9
  };
  const locationMultipliers = {
    "North America": 1.1,
    "Europe": 1.05,
    "Asia": 1,
    "Oceania": 0.95,
    "South America": 0.9,
    "Africa": 0.85
  };
  const categoryMultiplier = categoryMultipliers[data.marketCategory] || 1;
  const locationMultiplier = locationMultipliers[data.location] || 1;
  let baseScore = fundingScore * 0.35 + teamSizeScore * 0.2 + ageScore * 0.15 + sentimentScoreNormalized * 0.3;
  baseScore = baseScore * categoryMultiplier * locationMultiplier;
  const randomVariation = (Math.random() - 0.5) * 10;
  const finalScore = Math.max(5, Math.min(95, baseScore + randomVariation));
  return finalScore;
}
function calculateFeatureImportance(data, sentimentScore) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const companyAge = currentYear - data.foundedYear;
  const fundingImportance = Math.min(data.fundingAmount / 1e7 * 100, 100);
  const teamSizeImportance = Math.min(data.teamSize / 50 * 100, 100);
  const ageImportance = Math.min(companyAge / 10 * 100, 100);
  const sentimentImportance = sentimentScore * 100;
  const features = [
    {
      feature: "funding_total_usd",
      displayName: "Funding",
      importance: fundingImportance
    },
    {
      feature: "company_age",
      displayName: "Company Age",
      importance: ageImportance
    },
    {
      feature: "team_size",
      displayName: "Team Size",
      importance: teamSizeImportance
    },
    {
      feature: "sentiment",
      displayName: "Sentiment",
      importance: sentimentImportance
    },
    {
      feature: "market_category",
      displayName: "Market",
      importance: 70 + Math.random() * 20
    }
  ];
  return features.sort((a, b) => b.importance - a.importance);
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/predictions", async (req, res) => {
    try {
      const validatedData = createPredictionInputSchema.parse(req.body);
      let sentimentAnalysis = { sentiment: "Neutral", score: 0.5 };
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
        "Develop scalable business processes to support rapid growth efficiently"
      ];
      try {
        improvements = await generateImprovementSuggestions({
          startupName: validatedData.startupName,
          teamSize: validatedData.teamSize,
          fundingAmount: validatedData.fundingAmount,
          marketCategory: validatedData.marketCategory,
          description: validatedData.description,
          successProbability,
          sentiment: sentimentAnalysis.sentiment
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
        improvements: JSON.stringify(improvements)
      });
      const result = {
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment,
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance),
        improvements: JSON.parse(prediction.improvements),
        createdAt: prediction.createdAt.toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Prediction error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create prediction"
      });
    }
  });
  app2.get("/api/predictions/:id", async (req, res) => {
    try {
      const prediction = await storage.getPrediction(req.params.id);
      if (!prediction) {
        return res.status(404).json({ error: "Prediction not found" });
      }
      const result = {
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment,
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance),
        improvements: JSON.parse(prediction.improvements),
        createdAt: prediction.createdAt.toISOString()
      };
      res.json(result);
    } catch (error) {
      console.error("Get prediction error:", error);
      res.status(500).json({ error: "Failed to retrieve prediction" });
    }
  });
  app2.get("/api/predictions", async (req, res) => {
    try {
      const predictions2 = await storage.getAllPredictions();
      const results = predictions2.map((prediction) => ({
        id: prediction.id,
        startupName: prediction.startupName,
        foundedYear: prediction.foundedYear,
        teamSize: prediction.teamSize,
        marketCategory: prediction.marketCategory,
        location: prediction.location,
        fundingAmount: prediction.fundingAmount,
        description: prediction.description,
        successProbability: prediction.successProbability,
        sentiment: prediction.sentiment,
        sentimentScore: prediction.sentimentScore,
        featureImportance: JSON.parse(prediction.featureImportance),
        improvements: JSON.parse(prediction.improvements),
        createdAt: prediction.createdAt.toISOString()
      }));
      res.json(results);
    } catch (error) {
      console.error("Get all predictions error:", error);
      res.status(500).json({ error: "Failed to retrieve predictions" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import http from "http";
var app = express2();
app.use(
  express2.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = http.createServer(app);
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("Error:", err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(` Server running at http://localhost:${port}`);
  });
})();
