import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, CompetitorAnalysisResult, GeneratedCreative, AdMetric, BudgetAnalysisResult, MerchantAnalysisResult, MarketNewsResult, MetaTrendResult, OmniscienceResult, InfluencerMarketingResult, MessagePipelineResult } from "../types";

const getAiClient = () => {
  // Use environment variable or fallback to the provided key
  const apiKey = process.env.API_KEY || "AIzaSyAYDr7cZDBsUiWnEajzsd6I5yGv8y7U0DM";
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
}

// Helper for rate limit retries
const retryOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  baseDelay: number = 4000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 ||
        error?.message?.includes('429') || 
        error?.message?.includes('Quota exceeded') ||
        error?.message?.includes('RESOURCE_EXHAUSTED');

      if (!isRateLimit) {
        throw error;
      }

      if (i === maxRetries - 1) break;

      let delay = baseDelay * Math.pow(2, i);
      const match = error?.message?.match(/retry in\s*(\d+(\.\d+)?)\s*s/i);
      
      if (match && match[1]) {
         delay = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
      }

      console.warn(`[Gemini API] Rate limit hit. Waiting ${delay}ms before retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const createStrategyChatSession = () => {
  const ai = getAiClient();
  return ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: `You are the Prethink.ai Chief Strategy Officer (CSO) Assistant.
Your goal is to help the user navigate the Prethink.ai platform, answer marketing strategy questions, and provide data-backed advice.

STRICT RULES:
1. DO NOT HALLUCINATE. If you do not know a metric, influencer price, or data point, state clearly that you do not have that data.
2. Base all your marketing advice on established, high-ROI performance marketing principles.
3. You have access to the following tools in the Prethink.ai dashboard:
   - Omniscience Engine: Scrapes Reddit/Amazon for competitor vulnerabilities and generates video hooks.
   - Influencer Asset Lab: Allocates budget across Safe Bets and High-Growth influencers with predictive POAS and deep price analysis.
   - WhatsApp & Email Strategy: Turns raw market data into high-converting messaging campaigns based on age and geography.
   - Merchant Intelligence: Analyzes Shopify/WooCommerce data for LTV, CAC, and retention.
   - Meta Trends: Scrapes TikTok/Reels for viral audio and meme formats.
   - Competitor X-Ray: Analyzes competitor ad libraries.
   - Capital Allocator: Reallocates ad spend based on ROAS.
   - Historical Ledger: Analyzes past ad performance.
4. If the user asks you to "do a task", guide them to the exact tool in the dashboard they should use, OR provide the strategic framework they need right here in the chat.
5. Keep your answers concise, highly actionable, and formatted with markdown (bullet points, bold text).
6. Never make up specific influencer names or exact CPMs unless providing a hypothetical example (and label it as such).`
    }
  });
};

export const analyzeAdsData = async (csvData: string): Promise<AnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    You are PreThink AI, an institutional-grade Quantitative Ad Analyst.
    
    Your Goal: Ingest the provided advertising performance ledger (CSV) and output a high-frequency capital allocation strategy.

    STRICT DATA CONSTRAINTS (DO NOT HALLUCINATE):
    1. **Source of Truth**: Analyze ONLY the rows provided in the "DATA STREAM" below. Do not generate fake ads or mock data.
    2. **Column Mapping**:
       - The CSV contains: ad_name, platform, impressions, clicks, ctr, spend, conversions, roas, creative_type, audience.
       - **ID**: Since 'ad_id' is missing, generate a short ID based on 'ad_name' (e.g. "Reel_Fashion_01").
       - **Revenue**: The CSV does not have a 'revenue' column. You MUST CALCULATE Revenue as: (spend * roas).
       - **ROI**: Use the 'roas' value directly from the CSV.
    3. **Precision**: Maintain exact numbers from the CSV for spend, impressions, and clicks.

    DATA STREAM:
    ${csvData}

    EXECUTION PROTOCOL:
    1.  **Alpha Detection (Top Assets)**: Identify campaigns with high ROAS and scalability. These are your "Long" positions.
    2.  **Risk Assessment (Liabilities)**: Identify campaigns burning cash with low ROAS. These are your "Short" or "Kill" positions.
    3.  **Pattern Recognition**: Extract non-obvious correlations between Creative Type, Platform, and Audience that drive Alpha.
    4.  **Strategic Memorandum**: Write a concise, executive-level summary of the portfolio's health based strictly on the data.

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          top_ads: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                creative_type: { type: Type.STRING },
                platform: { type: Type.STRING },
                audience: { type: Type.STRING },
                spend: { type: Type.NUMBER },
                revenue: { type: Type.NUMBER },
                roi: { type: Type.NUMBER, description: "ROAS (Revenue / Spend)" },
                ctr: { type: Type.NUMBER, description: "Click Through Rate in percentage" },
                impressions: { type: Type.NUMBER },
                clicks: { type: Type.NUMBER },
                reason: { type: Type.STRING, description: "Analyst note on why this is a buy" }
              },
              required: ["id", "name", "spend", "revenue", "roi", "reason"]
            }
          },
          low_ads: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                creative_type: { type: Type.STRING },
                platform: { type: Type.STRING },
                audience: { type: Type.STRING },
                spend: { type: Type.NUMBER },
                revenue: { type: Type.NUMBER },
                roi: { type: Type.NUMBER },
                ctr: { type: Type.NUMBER },
                impressions: { type: Type.NUMBER },
                clicks: { type: Type.NUMBER },
                reason: { type: Type.STRING, description: "Analyst note on why this is a sell" }
              },
              required: ["id", "name", "spend", "revenue", "roi", "reason"]
            }
          },
          patterns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of identified market patterns"
          },
          performance_summary: {
            type: Type.STRING,
            description: "Executive summary for the portfolio manager"
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              scale_actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable scaling commands"
              },
              pause_actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable pause commands"
              },
              test_ideas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "New alpha generation ideas"
              },
              budget_shift_tip: {
                type: Type.STRING,
                description: "Capital reallocation instruction"
              }
            },
            required: ["scale_actions", "pause_actions", "test_ideas", "budget_shift_tip"]
          }
        },
        required: ["top_ads", "low_ads", "patterns", "performance_summary", "recommendations"]
      }
    }
  }));

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as AnalysisResult;
};

export const analyzeCompetitors = async (myCompany: string, competitors: string, industry: string): Promise<CompetitorAnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    You are the Director of Market Intelligence at a top-tier Strategy Consulting Firm.
    
    CLIENT: ${myCompany}
    COMPETITORS: ${competitors}
    SECTOR: ${industry}

    MISSION:
    Perform a ruthless, deep-dive competitive analysis to identify operational vulnerabilities in the opposition and map out a "Market Capture Playbook" for the Client.

    TASKS:
    1.  **Market Landscape**: Estimate relative Market Share, Brand Sentiment, and Ad Intensity based on real industry knowledge.
    2.  **Operational Forensics (Case Studies)**: Analyze specific, real-world examples of how these competitors operate. Don't just list generic info. Analyze their funnel structure, their offers (free trials? bundles?), and their creative refresh rate.
    3.  **Ad Reconnaissance Report**: Break down the specific creative strategy. What is their "Winning Hook"? Are they using UGC or Studio? What is the psychological angle of their copy?
    4.  **Market Capture Playbook**: This is the most critical section.
        - Identify a specific *Operational Vulnerability* for each competitor (e.g., "They have slow customer support", "Their ads are too corporate", "They rely on discounts").
        - Define a *Counter-Tactic* for ${myCompany} to exploit this.
        - List 2-3 specific *Execution Steps* to steal their market share.

    TONE: Strategic, machiavellian, insightful, direct. Use industry standard terminology.

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          market_landscape: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                market_share_est: { type: Type.NUMBER, description: "Estimated market share percentage" },
                brand_sentiment: { type: Type.NUMBER, description: "0-100 Score" },
                ad_intensity: { type: Type.NUMBER, description: "0-100 Score" },
                main_strategy: { type: Type.STRING, description: "Primary go-to-market strategy" }
              },
              required: ["name", "market_share_est", "brand_sentiment", "ad_intensity", "main_strategy"]
            }
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
          },
          key_insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Critical strategic observations"
          },
          attack_vectors: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific strategies to capture market share"
          },
          case_studies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                title: { type: Type.STRING },
                scenario: { type: Type.STRING, description: "The operational context or campaign" },
                strategy_executed: { type: Type.STRING, description: "The specific tactics used" },
                result_metrics: { type: Type.STRING, description: "The outcome or impact" }
              },
              required: ["company", "title", "scenario", "strategy_executed", "result_metrics"]
            }
          },
          ad_details: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                competitor_name: { type: Type.STRING },
                primary_hook: { type: Type.STRING, description: "The scroll-stopping element" },
                visual_style: { type: Type.STRING },
                copy_framework: { type: Type.STRING },
                est_monthly_spend: { type: Type.STRING }
              },
              required: ["competitor_name", "primary_hook", "visual_style", "copy_framework", "est_monthly_spend"]
            }
          },
          market_capture_playbook: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                competitor_target: { type: Type.STRING },
                vulnerability: { type: Type.STRING, description: "Operational weakness" },
                counter_tactic: { type: Type.STRING, description: "Exploitation strategy" },
                execution_steps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["competitor_target", "vulnerability", "counter_tactic", "execution_steps"]
            }
          }
        },
        required: ["market_landscape", "swot", "key_insights", "attack_vectors", "case_studies", "ad_details", "market_capture_playbook"]
      }
    }
  }));

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as CompetitorAnalysisResult;
};

// --- AD GENERATOR SERVICE ---

export const generateAdCreative = async (
  productImageBase64: string, 
  topAds: AdMetric[],
  customBackground?: string,
  customHeadline?: string
): Promise<GeneratedCreative> => {
  const ai = getAiClient();

  // 1. Extract winning characteristics from topAds
  const winningPatterns = topAds.map(ad => 
    `${ad.creative_type} format on ${ad.platform} (ROAS: ${ad.roi}x)`
  ).slice(0, 5).join("; ");

  let prompt = `
    You are a world-class 3D Ad Designer and Creative Director.
    
    INPUT:
    1. A product image (attached).
    2. Historical Performance Context: The user's winning ads have these characteristics: [${winningPatterns}].
  `;

  if (customBackground) {
    prompt += `\n3. USER OVERRIDE - BACKGROUND: The user explicitly wants the background to be: "${customBackground}".`;
  } else {
    prompt += `\n3. BACKGROUND STRATEGY: Use the historical context to infer a high-converting background.`;
  }

  if (customHeadline) {
    prompt += `\n4. USER OVERRIDE - TEXT: The headline MUST be: "${customHeadline}".`;
  } else {
    prompt += `\n4. COPY STRATEGY: Generate a catchy headline (max 5 words) based on the winning ads.`;
  }

  prompt += `
    TASK:
    Generate a stunning, photorealistic 3D advertising image for this product. 
    - The style should be professional, high-end, and "scroll-stopping".
    - Focus on a UGC (User Generated Content) style 3D render that looks native to social feeds.
    - The output MUST be a high-quality generated image.
    
    ALSO GENERATE (in text):
    - Headline: [The headline]
    - Hook: [A short explanation of why this visual works]
  `;

  // Increase retries for image generation as it is rate-limited more aggressively
  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-2.5-flash-image", // Reverted to 2.5-flash for free tier
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: productImageBase64
          }
        },
        { text: prompt }
      ]
    }
  }), 5, 5000); // 5 Retries, starting at 5s

  let generatedImageUrl = "";
  let textResponse = "";

  // Parse Multi-part response
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        textResponse += part.text;
      }
    }
  }

  // If the model didn't return structured JSON (it likely won't with image generation mixed in),
  // we parse the text response heuristically or return raw text.
  
  const headlineMatch = textResponse.match(/Headline:\s*(.*)/i);
  const hookMatch = textResponse.match(/Hook:\s*(.*)/i);

  return {
    imageUrl: generatedImageUrl,
    headline: headlineMatch ? headlineMatch[1].trim() : (customHeadline || "New 3D Ad Creative"),
    hook: hookMatch ? hookMatch[1].trim() : "Optimized based on your historical high-ROAS data.",
    reasoning: "Generated using Gemini 2.5 Computer Vision & Predictive Creative Analysis."
  };
};

export const analyzeBudgetAndCreative = async (csvData: string): Promise<BudgetAnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    You are an AI Marketing Performance Engine inside a personal dashboard.

    Your job is to analyze real-time ad campaign data and generate smart decisions, creative recommendations, and budget allocation insights.

    INPUT DATA FIELDS:
    date, campaign_name, ad_set, ad_name, platform, impressions, clicks, ctr, spend, conversions, purchase_roas, creative_type, audience, decision_status, priority_level, ml_budget_allocation, performance_trend, ai_live_signal, notes.

    CORE TASKS:

    1. AD FATIGUE DETECTION
    * Detect fatigue if CTR drops, performance_trend is DOWN, or repeated MONITOR signals.
    * Recommend: change creative, background, format, or messaging.
    * Explain WHY briefly.

    2. REALTIME BUDGET ALLOCATION
    * If ai_live_signal = WINNER or performance_trend = UP:
    → Suggest scaling budget using ml_budget_allocation.
    * If performance_trend = DOWN:
    → Reduce spend and suggest creative refresh.

    3. CREATIVE AI RECOMMENDATIONS
    Use past performance patterns to suggest:
    * best background style
    * text tone
    * colour palette
    * format (image/video/3D)

    4. GEMINI CREATIVE GENERATOR INSTRUCTIONS
    Generate structured output for "best performing" combination:
    {
    "visual_style": "...",
    "background": "...",
    "text_style": "...",
    "colour_theme": "...",
    "ad_direction_3d": "...",
    "short_video_direction": "..."
    }

    5. DASHBOARD OUTPUT FORMAT
    Always respond in 5 sections.

    DATA STREAM:
    ${csvData}

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ai_insights: {
            type: Type.OBJECT,
            properties: {
              fatigue_alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
              performance_summary: { type: Type.STRING }
            },
            required: ["fatigue_alerts", "performance_summary"]
          },
          budget_actions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                campaign: { type: Type.STRING },
                action: { type: Type.STRING, enum: ["SCALE", "REDUCE", "MONITOR", "KILL"] },
                amount_suggestion: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
              required: ["campaign", "action", "amount_suggestion", "reasoning"]
            }
          },
          creative_changes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ad_name: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
              },
              required: ["ad_name", "suggestion", "priority"]
            }
          },
          gemini_generation_prompt: {
            type: Type.OBJECT,
            properties: {
              visual_style: { type: Type.STRING },
              background: { type: Type.STRING },
              text_style: { type: Type.STRING },
              colour_theme: { type: Type.STRING },
              ad_direction_3d: { type: Type.STRING },
              short_video_direction: { type: Type.STRING }
            },
            required: ["visual_style", "background", "text_style", "colour_theme", "ad_direction_3d", "short_video_direction"]
          },
          realtime_notes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["ai_insights", "budget_actions", "creative_changes", "gemini_generation_prompt", "realtime_notes"]
      }
    }
  }));

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as BudgetAnalysisResult;
};

// Helper for the Creative Generation within Budget Allocator
export const generateCreativeFromPrompt = async (
  productImageBase64: string,
  genPrompt: any
): Promise<GeneratedCreative> => {
  const ai = getAiClient();
  
  const instruction = `
    You are an expert Ad Creative Generator.
    Use the following specialized styles to generate a high-performing ad image for the attached product.
    
    STYLE GUIDES:
    - Visual Style: ${genPrompt.visual_style}
    - Background: ${genPrompt.background}
    - Colour Theme: ${genPrompt.colour_theme}
    - 3D Direction: ${genPrompt.ad_direction_3d}
    
    TEXT OVERLAY:
    - Style: ${genPrompt.text_style}
    
    OUTPUT:
    Generate a photorealistic ad image.
    Also provide a Headline and Hook in the text response.
  `;

  // Increase retries for image generation
  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: productImageBase64 } },
        { text: instruction }
      ]
    }
  }), 5, 5000);

  let generatedImageUrl = "";
  let textResponse = "";

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        textResponse += part.text;
      }
    }
  }

  const headlineMatch = textResponse.match(/Headline:\s*(.*)/i);
  const hookMatch = textResponse.match(/Hook:\s*(.*)/i);

  return {
    imageUrl: generatedImageUrl,
    headline: headlineMatch ? headlineMatch[1].trim() : "AI Optimized Creative",
    hook: hookMatch ? hookMatch[1].trim() : "High-CTR Visual Pattern",
    reasoning: "Generated based on real-time campaign winning signals."
  };
};

export const analyzeMerchantData = async (csvData: string): Promise<MerchantAnalysisResult> => {
  const ai = getAiClient();

  const prompt = `
    You are a Strategic CFO and Ecommerce Analyst for a direct-to-consumer brand.
    
    YOUR GOAL:
    Analyze the provided product sales data (merged with ad spend) to determine Profit on Ad Spend (POAS) and contribution margins.
    You must identify "Fake Winners" (High ROAS, Low Margin) vs "Hidden Scalers" (Lower ROAS, but High Margin).

    DATA COLUMNS:
    sku, product_name, ad_spend, sales_revenue, units_sold, unit_price, unit_cogs, shipping_cost_avg

    CALCULATION RULES:
    1. **Gross Profit Per Unit** = Unit Price - Unit COGS - Avg Shipping
    2. **Total Net Profit** = (Gross Profit Per Unit * Units Sold) - Ad Spend
    3. **Profit Margin %** = (Gross Profit Per Unit / Unit Price) * 100
    4. **Break Even ROAS** = 1 / (Profit Margin % / 100)
    5. **Actual ROAS** = Sales Revenue / Ad Spend
    6. **POAS (Profit on Ad Spend)** = (Gross Profit Per Unit * Units Sold) / Ad Spend

    DATA STREAM:
    ${csvData}

    DECISION LOGIC:
    - If POAS > 1.2 AND Actual ROAS > Break Even ROAS: **PUSH_AGGRESSIVE** (Profitable scaler)
    - If POAS > 1.0 AND Actual ROAS > Break Even ROAS: **MAINTAIN** (Healthy)
    - If POAS < 1.0 OR Actual ROAS < Break Even ROAS: **LIQUIDATE** (Burning cash)

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          products: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sku: { type: Type.STRING },
                product_name: { type: Type.STRING },
                spend: { type: Type.NUMBER },
                revenue: { type: Type.NUMBER },
                cogs: { type: Type.NUMBER },
                profit_margin_pct: { type: Type.NUMBER },
                break_even_roas: { type: Type.NUMBER },
                actual_roas: { type: Type.NUMBER },
                poas: { type: Type.NUMBER, description: "True Profit on Ad Spend" },
                net_profit: { type: Type.NUMBER },
                recommendation: { type: Type.STRING, enum: ['PUSH_AGGRESSIVE', 'MAINTAIN', 'LIQUIDATE'] }
              },
              required: ["sku", "product_name", "spend", "revenue", "cogs", "profit_margin_pct", "break_even_roas", "actual_roas", "poas", "net_profit", "recommendation"]
            }
          },
          global_metrics: {
            type: Type.OBJECT,
            properties: {
              total_spend: { type: Type.NUMBER },
              total_net_profit: { type: Type.NUMBER },
              blended_roas: { type: Type.NUMBER },
              blended_poas: { type: Type.NUMBER }
            },
            required: ["total_spend", "total_net_profit", "blended_roas", "blended_poas"]
          },
          strategic_advice: { type: Type.STRING },
          scaling_opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["products", "global_metrics", "strategic_advice", "scaling_opportunities"]
      }
    }
  }));

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as MerchantAnalysisResult;
};

export const fetchMarketNews = async (industry: string): Promise<MarketNewsResult> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a Real-Time Market Intelligence Analyst.
    
    TASK:
    Analyze the current news and trends for the "${industry}" industry.
    Use Google Search to find the latest, most relevant news stories from the last 24-48 hours.
    Identify key trends that are spiking right now.
    Analyze the marketing implications of these trends.
    
    OUTPUT REQUIREMENTS:
    1. News Feed: 3-5 top stories with source, summary, and sentiment.
    2. Trending Topics: 3-5 keywords or themes with growth context.
    3. Real-Time Analysis: A synthesis of what is happening NOW.
    4. Marketing Implications: Actionable advice for marketers in this space.
    
    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          industry: { type: Type.STRING },
          news_feed: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                summary: { type: Type.STRING },
                sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
                url: { type: Type.STRING },
                published_time: { type: Type.STRING }
              },
              required: ["title", "source", "summary", "sentiment", "url"]
            }
          },
          trending_topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                volume: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                growth_rate: { type: Type.STRING },
                context: { type: Type.STRING }
              },
              required: ["topic", "volume", "growth_rate", "context"]
            }
          },
          real_time_analysis: { type: Type.STRING },
          marketing_implications: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["industry", "news_feed", "trending_topics", "real_time_analysis", "marketing_implications"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as MarketNewsResult;
};

export const fetchMetaTrends = async (): Promise<MetaTrendResult> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a Viral Content Strategist for Meta (Instagram & Facebook).
    
    TASK:
    Identify the top trending memes, audio, and ad formats on Instagram Reels and Facebook RIGHT NOW (last 7 days).
    Use Google Search to find real-time viral trends.
    
    OUTPUT REQUIREMENTS:
    1. Viral Memes: 3 specific meme formats currently blowing up. Include visual style, why it's viral, and an example hook/text overlay.
    2. Trending Audio: 3 trending audio tracks or sound bites with mood and usage context.
    3. Ad Formats: 3 trending visual formats (e.g., "Green Screen", "Tweet on Background").
    4. Deep Strategy: A high-level strategic breakdown of *why* these trends are working psychologically.
    5. Actionable Hooks: 5 specific, copy-paste hooks that brands can use with these trends.
    
    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viral_memes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                visual_style: { type: Type.STRING },
                viral_reason: { type: Type.STRING },
                example_hook: { type: Type.STRING },
                example_text_overlay: { type: Type.STRING }
              },
              required: ["name", "description", "visual_style", "viral_reason", "example_hook", "example_text_overlay"]
            }
          },
          trending_audio: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                mood: { type: Type.STRING },
                usage_context: { type: Type.STRING }
              },
              required: ["name", "mood", "usage_context"]
            }
          },
          ad_formats: { type: Type.ARRAY, items: { type: Type.STRING } },
          deep_strategy: { type: Type.STRING },
          actionable_hooks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["viral_memes", "trending_audio", "ad_formats", "deep_strategy", "actionable_hooks"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as MetaTrendResult;
};

export const fetchOmniscienceData = async (product: string, competitors: string): Promise<OmniscienceResult> => {
  const ai = getAiClient();
  
  const prompt = `
    System Role: You are the Prethink.ai Omniscience Engine. Your goal is to identify market gaps by analyzing the entire digital footprint of a sector.

    Task: Conduct an All-Source Market Analysis for:
    My Product: ${product}
    Primary Competitors: ${competitors}

    Perform Deep-Level Forensic Functions:
    1. Multidimensional Sentiment Mapping (Reddit/Amazon):
       - Vulnerability Vector: Scan for high-engagement "venting" posts to identify specific competitor product failures.
       - Feature Gap Analysis: Cluster recurring "I wish this had..." comments to create a USP roadmap.
       - Slang & Lingo Extraction: Identify exact vocabulary used by the target audience.

    2. The Video Hook & Creative Strategy:
       Generate 3 Video Creative Blueprints. Each must have:
       - Pattern Interrupt Hook (0-3s): Provide one "Confrontational Hook" and one "Social Proof Hook" using Reddit/Amazon data.
       - Visual Proof (3-15s): Suggest AI-edited B-roll or UGC styles highlighting the solution.
       - Regret Minimization CTA: Craft a CTA that reduces perceived risk of switching.

    3. In-Depth Intelligence Report (Market Forensics):
       - Sentiment Heatmap: Cross-platform frustration levels and the best time to "attack".
       - Competitor Blindspots: Features rivals ignore but customers demand, with new ad angles.
       - Content DNA: Analysis of top-performing viral videos, providing script templates.
       - Platform-Specific Hooks: Tailored hooks for TikTok vs YouTube vs Instagram.

    4. Strategic Implementation for MSMEs:
       Explain how this data helps MSMEs by Eliminating Research Costs, ensuring Data-Backed Spending, and enabling Rapid Iteration.

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reddit_forensics: {
            type: Type.OBJECT,
            properties: {
              vulnerability_vector: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    source: { type: Type.STRING },
                    engagement_level: { type: Type.STRING }
                  },
                  required: ["issue", "source", "engagement_level"]
                }
              },
              feature_gap_analysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    missing_feature: { type: Type.STRING },
                    customer_demand: { type: Type.STRING },
                    usp_roadmap: { type: Type.STRING }
                  },
                  required: ["missing_feature", "customer_demand", "usp_roadmap"]
                }
              },
              slang_and_lingo: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["vulnerability_vector", "feature_gap_analysis", "slang_and_lingo"]
          },
          video_creative_blueprints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                concept_name: { type: Type.STRING },
                pattern_interrupt_hooks: {
                  type: Type.OBJECT,
                  properties: {
                    confrontational: { type: Type.STRING },
                    social_proof: { type: Type.STRING }
                  },
                  required: ["confrontational", "social_proof"]
                },
                visual_proof: { type: Type.STRING },
                regret_minimization_cta: { type: Type.STRING }
              },
              required: ["concept_name", "pattern_interrupt_hooks", "visual_proof", "regret_minimization_cta"]
            }
          },
          market_forensics_report: {
            type: Type.OBJECT,
            properties: {
              sentiment_heatmap: {
                type: Type.OBJECT,
                properties: {
                  frustration_level: { type: Type.STRING },
                  attack_timing: { type: Type.STRING },
                  platforms_analyzed: { type: Type.STRING }
                },
                required: ["frustration_level", "attack_timing", "platforms_analyzed"]
              },
              competitor_blindspots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ignored_feature: { type: Type.STRING },
                    new_ad_angle: { type: Type.STRING }
                  },
                  required: ["ignored_feature", "new_ad_angle"]
                }
              },
              content_dna: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    viral_element: { type: Type.STRING },
                    script_template: { type: Type.STRING }
                  },
                  required: ["viral_element", "script_template"]
                }
              },
              platform_specific_hooks: {
                type: Type.OBJECT,
                properties: {
                  tiktok: { type: Type.STRING },
                  youtube: { type: Type.STRING },
                  instagram: { type: Type.STRING }
                },
                required: ["tiktok", "youtube", "instagram"]
              }
            },
            required: ["sentiment_heatmap", "competitor_blindspots", "content_dna", "platform_specific_hooks"]
          },
          msme_strategic_implementation: {
            type: Type.OBJECT,
            properties: {
              cost_elimination: { type: Type.STRING },
              data_backed_spending: { type: Type.STRING },
              rapid_iteration: { type: Type.STRING }
            },
            required: ["cost_elimination", "data_backed_spending", "rapid_iteration"]
          }
        },
        required: ["reddit_forensics", "video_creative_blueprints", "market_forensics_report", "msme_strategic_implementation"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as OmniscienceResult;
};

export const fetchInfluencerStrategy = async (budget: string, product: string, goal: string, location: string): Promise<InfluencerMarketingResult> => {
  const ai = getAiClient();
  
  const prompt = `
    System Role: You are the Prethink.ai Influencer Asset Lab. Your goal is to maximize ROI by treating influencers as a performance-driven asset class.

    Inputs:
    Total Budget: ${budget} (Respect the currency provided. Do not confuse USD and INR.)
    Sector/Product: ${product}
    Primary Goal: ${goal}
    Target Location: ${location} (Focus exclusively on influencers from this region)

    Task: Generate a "Risk-Weighted" Influencer Strategy:

    1. Selection & Platform: Identify the top 5-7 specific, real-world influencers across Instagram, YouTube, and LinkedIn relevant to this sector and location.
    2. Why them? Analyze their audience's "buying intent" and historical engagement for this specific sector.
    3. Why this platform? Explain why certain content works better on Reels vs. YouTube Shorts for this product.
    4. Predictive POAS (Profit on Ad Spend): Calculate the estimated profit multiplier for each influencer based on previous data/industry benchmarks.
    5. The "Hook" & Creative Brief: Provide a specific, data-backed hook for each influencer to use in the first 3 seconds. Create a "no-guesswork" brief that tells them exactly which product pain point to address.
    6. Deep Price Analysis & Allocation: Do NOT give exact fixed prices in rupees or dollars for individual influencers. Instead, use 'approx_allocation' as a percentage of the total budget (e.g., "15% - 20%"). Provide a 'price_analysis' detailing the estimated CPM, negotiation leverage (how the brand can negotiate a better deal), and potential hidden costs (e.g., production, licensing).
    7. Budget Allocation: Divide the total budget between "Safe Bets" (proven performers) and "High-Growth" (niche micro-influencers) using percentages (e.g., 70% and 30%) to ensure maximum impact with minimum waste.

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          influencers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                platform: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Safe Bet", "High-Growth"] },
                why_them: { type: Type.STRING },
                why_platform: { type: Type.STRING },
                predictive_poas: { type: Type.NUMBER },
                hook: { type: Type.STRING },
                creative_brief: { type: Type.STRING },
                approx_allocation: { type: Type.STRING },
                price_analysis: {
                  type: Type.OBJECT,
                  properties: {
                    estimated_cpm: { type: Type.STRING },
                    negotiation_leverage: { type: Type.STRING },
                    hidden_costs: { type: Type.STRING }
                  },
                  required: ["estimated_cpm", "negotiation_leverage", "hidden_costs"]
                }
              },
              required: ["name", "platform", "category", "why_them", "why_platform", "predictive_poas", "hook", "creative_brief", "approx_allocation", "price_analysis"]
            }
          },
          budget_split: {
            type: Type.OBJECT,
            properties: {
              safe_bets_percentage: { type: Type.NUMBER },
              high_growth_percentage: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["safe_bets_percentage", "high_growth_percentage", "reasoning"]
          },
          strategic_summary: { type: Type.STRING }
        },
        required: ["influencers", "budget_split", "strategic_summary"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as InfluencerMarketingResult;
};

export const fetchMessagePipeline = async (product: string, competitors: string): Promise<MessagePipelineResult> => {
  const ai = getAiClient();
  
  const prompt = `
    System Role: You are the Prethink.ai Data-to-Message Pipeline. Your goal is to turn raw market data into high-converting WhatsApp and Email campaigns.

    Inputs:
    My Product: ${product}
    Primary Competitors: ${competitors}

    Task:
    1. Scanning & Scraping: Use Google Search to find unfiltered opinions on Reddit, Amazon reviews, and industry articles about the competitors. Identify specific vulnerabilities (e.g., broken parts, slow shipping).
    2. Point Extraction: Extract 3 "High-Impact Points". For each, identify the exact "Pain Point", the "Desired Outcome", and map the specific "Customer Lingo" used.
    3. Strategy & Scripting: Generate 3 multi-channel campaigns based on these points.
       - Target Demographic: Define the specific age group, geography (e.g., Tier 1 Cities, Suburban US), and behavioral trait for this campaign.
       - Optimal Dispatch Timing: Provide the exact best time to send the WhatsApp message and the Email based on the age and geography, along with the psychological reasoning.
       - Hook: A direct address to the extracted point.
       - WhatsApp: Short, conversational nudge with a clear CTA.
       - Email: Longer narrative including a Subject Line, Body, and a Social Proof quote (e.g., from an Amazon review).

    Generate the response in strict JSON format matching the schema.
  `;

  const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extracted_points: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pain_point: { type: Type.STRING },
                desired_outcome: { type: Type.STRING },
                customer_lingo: { type: Type.ARRAY, items: { type: Type.STRING } },
                source_vulnerability: { type: Type.STRING }
              },
              required: ["pain_point", "desired_outcome", "customer_lingo", "source_vulnerability"]
            }
          },
          campaigns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                campaign_name: { type: Type.STRING },
                target_demographic: {
                  type: Type.OBJECT,
                  properties: {
                    age_group: { type: Type.STRING },
                    geography: { type: Type.STRING },
                    behavioral_trait: { type: Type.STRING }
                  },
                  required: ["age_group", "geography", "behavioral_trait"]
                },
                optimal_dispatch_time: {
                  type: Type.OBJECT,
                  properties: {
                    whatsapp: { type: Type.STRING },
                    email: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                  },
                  required: ["whatsapp", "email", "reasoning"]
                },
                hook: { type: Type.STRING },
                whatsapp_copy: { type: Type.STRING },
                email_subject: { type: Type.STRING },
                email_body: { type: Type.STRING },
                social_proof_quote: { type: Type.STRING }
              },
              required: ["campaign_name", "target_demographic", "optimal_dispatch_time", "hook", "whatsapp_copy", "email_subject", "email_body", "social_proof_quote"]
            }
          },
          strategic_summary: { type: Type.STRING }
        },
        required: ["extracted_points", "campaigns", "strategic_summary"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as MessagePipelineResult;
};