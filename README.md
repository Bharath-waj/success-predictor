# 🚀 Startup Success Predictor

## 💡 Overview

The **Startup Success Predictor** is an AI-powered web application designed to analyze startup viability and predict success probability using machine learning and large language models.  

The system processes crucial startup data — including company details, team size, funding, market category, and descriptive text — to generate **comprehensive predictions**, **visual insights**, and **actionable improvement suggestions**.

Predictions are calculated using a **proprietary algorithm** that weighs multiple factors (funding, team size, company age, sentiment score) and applies **category-specific and location-based multipliers** to simulate real-world market dynamics.

---

## ✨ Features

- **AI-Powered Analysis:** Leverages OpenAI's **GPT-5** model for sentiment analysis of startup descriptions and personalized improvement recommendations.  
- **Proprietary Prediction Algorithm:** Calculates success probability based on weighted factors:  
  - Funding: 35%  
  - Team Size: 20%  
  - Sentiment: 30%  
  - Company Age: 15%  
- **Data Visualization:** Uses **Recharts** to render interactive charts, including circular gauges for probability and bar/radar charts for feature importance.  
- **Modern Component System:** Built with **shadcn/ui** components for an accessible, customizable interface following **Material Design 3** principles.  
- **Real-time Server State:** Utilizes **React Query (TanStack Query)** for robust server state management, caching, and error handling.  

---

## 🛠️ Tech Stack & Architecture

This project uses a **monorepo structure** with distinct technologies for the **client** and **server**.

---

### 🖥️ Frontend Architecture

| Category | Technology | Description |
|-----------|-------------|-------------|
| **Framework** | React with TypeScript | Core UI library built with type safety via TypeScript. |
| **Build Tool** | Vite | Fast development server and build tool. |
| **UI Components** | shadcn/ui (Radix Primitives) | Accessible, customizable components following the "New York" design style. |
| **Styling** | Tailwind CSS / Inter Font | Utility-first styling with a custom neutral color scheme and the Inter font family. |
| **State Management** | React Query (TanStack Query) | Handles server state, data fetching, caching, and error handling. |
| **Routing** | Wouter | Lightweight client-side routing. |
| **Visualization** | Recharts | Renders interactive charts (gauges, bars, radar) for results display. |

---

### ⚙️ Backend Architecture

| Category | Technology | Description |
|-----------|-------------|-------------|
| **Server Framework** | Node.js / Express.js | Handles API routing (`/api/predictions`), middleware (logging, parsing), and serves the frontend in production. |
| **API Design** | RESTful | Single `POST /api/predictions` endpoint for data processing, AI analysis, and prediction calculation. |
| **AI Integration** | OpenAI API (GPT-5) | Used for sentiment analysis and generating tailored improvement suggestions. |
| **Storage (Configured)** | PostgreSQL via Neon / Drizzle ORM | Defines schema for users and predictions. Uses serverless driver `@neondatabase/serverless`. |
| **Current Storage** | In-Memory (JavaScript Maps) | Used for development and demonstration; data is lost on server restart. |

---

## 📦 Getting Started

Follow these steps to get your development environment set up and running locally.

### ✅ Prerequisites

- **Node.js (v18 or higher)**  
- **npm or yarn** (npm is assumed in the commands below)  
- **OpenAI API Key** (required for full functionality, though prediction will still run without AI features)

---

### 🧩 1. Installation

Install all project dependencies from the root directory:

```bash
npm install
```

## ⚙️ 2. Environment Variables

Create a file named **.env** in the root directory of the project.

```bash
# .env Configuration

# --- Server Variables (Required) ---
PORT=5000
OPENAI_API_KEY="YOUR_GPT_5_API_KEY"

# --- Database Variables (Optional - Only required for PostgreSQL storage) ---
DATABASE_URL="postgresql://user:password@host:port/dbname"

# --- Client Variables (Vite Convention) ---
VITE_API_URL="http://localhost:5000"
```

