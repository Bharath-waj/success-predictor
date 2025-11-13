import "dotenv/config";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(text: string): Promise<{
  sentiment: "Positive" | "Neutral" | "Negative";
  score: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of startup descriptions. Provide a sentiment classification (Positive, Neutral, or Negative) and a confidence score between 0 and 1. Respond with JSON in this format: { 'sentiment': string, 'score': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      sentiment: result.sentiment || "Neutral",
      score: Math.max(0, Math.min(1, result.score || 0.5)),
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return {
      sentiment: "Neutral",
      score: 0.5,
    };
  }
}

export async function generateImprovementSuggestions(data: {
  startupName: string;
  teamSize: number;
  fundingAmount: number;
  marketCategory: string;
  description: string;
  successProbability: number;
  sentiment: string;
}): Promise<string[]> {
  try {
    const prompt = `You are a startup consultant AI. Based on the following startup data, provide 4-6 specific, actionable improvement suggestions to increase their success probability. Be concise and practical.

Startup: ${data.startupName}
Team Size: ${data.teamSize}
Funding: $${(data.fundingAmount / 1000000).toFixed(2)}M
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
          content: "You are a startup business consultant providing actionable advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestions || [
      "Expand your team to cover critical skill gaps",
      "Increase market research to better understand customer needs",
      "Develop a stronger go-to-market strategy",
      "Build strategic partnerships to accelerate growth",
    ];
  } catch (error) {
    console.error("Improvement suggestions error:", error);
    return [
      "Focus on customer acquisition and retention strategies",
      "Optimize your product-market fit through user feedback",
      "Build a strong brand presence in your target market",
      "Develop scalable business processes",
    ];
  }
}
