export interface AdMetric {
  id: string;
  name: string;
  creative_type: string;
  platform: string;
  audience: string;
  spend: number;
  revenue: number;
  roi: number;
  ctr: number;
  impressions: number;
  clicks: number;
  reason?: string; // AI's reasoning for selection
  thumbnail?: string; // URL to ad creative image
}

export interface Recommendations {
  scale_actions: string[];
  pause_actions: string[];
  test_ideas: string[];
  budget_shift_tip: string;
}

export interface AnalysisResult {
  top_ads: AdMetric[];
  low_ads: AdMetric[];
  patterns: string[];
  performance_summary: string;
  recommendations: Recommendations;
}

export interface CsvRow {
  [key: string]: string | number;
}

// --- Competitor Analysis Types ---

export interface CompetitorMetric {
  name: string;
  market_share_est: number; // Estimated percentage
  brand_sentiment: number; // 0 to 100
  ad_intensity: number; // 0 to 100 (how aggressive they are)
  main_strategy: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CaseStudy {
  company: string;
  title: string;
  scenario: string; // Context/Problem
  strategy_executed: string;
  result_metrics: string;
}

export interface AdAnalysisDetail {
  competitor_name: string;
  primary_hook: string; // The "stop scroll" element
  visual_style: string; // e.g. "High-contrast UGC", "Studio 3D"
  copy_framework: string; // e.g. "PAS (Problem-Agitation-Solution)"
  est_monthly_spend: string;
}

export interface MarketCaptureTactic {
  competitor_target: string;
  vulnerability: string; // The weak point in their operation
  counter_tactic: string; // How we exploit it
  execution_steps: string[]; // Step by step plan
}

export interface CompetitorAnalysisResult {
  market_landscape: CompetitorMetric[]; // Includes user's company and competitors
  swot: SwotAnalysis;
  key_insights: string[];
  attack_vectors: string[]; // Specific strategies to capture market share
  case_studies: CaseStudy[]; // New: Detailed case studies
  ad_details: AdAnalysisDetail[]; // New: Full ad detail report
  market_capture_playbook: MarketCaptureTactic[]; // New: Operational counter-strategies
}

// --- Ad Generator Types ---

export interface GeneratedCreative {
  imageUrl: string;
  headline: string;
  hook: string;
  reasoning: string;
}

// --- Budget & Creative Allocator Types ---

export interface BudgetAction {
  campaign: string;
  action: 'SCALE' | 'REDUCE' | 'MONITOR' | 'KILL';
  amount_suggestion: string;
  reasoning: string;
}

export interface CreativeChange {
  ad_name: string;
  suggestion: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GenAiPrompt {
  visual_style: string;
  background: string;
  text_style: string;
  colour_theme: string;
  ad_direction_3d: string;
  short_video_direction: string;
}

export interface BudgetAnalysisResult {
  ai_insights: {
    fatigue_alerts: string[];
    performance_summary: string;
  };
  budget_actions: BudgetAction[];
  creative_changes: CreativeChange[];
  gemini_generation_prompt: GenAiPrompt;
  realtime_notes: string[];
}

// --- Merchant/Shopify Intelligence Types ---

export interface ProductPerformance {
  sku: string;
  product_name: string;
  spend: number;
  revenue: number;
  cogs: number; // Cost of Goods Sold
  profit_margin_pct: number; // (Price - COGS) / Price
  break_even_roas: number; // 1 / Margin
  actual_roas: number;
  poas: number; // Profit On Ad Spend: (Gross Profit) / Spend
  net_profit: number;
  recommendation: 'PUSH_AGGRESSIVE' | 'MAINTAIN' | 'LIQUIDATE';
}

export interface MerchantAnalysisResult {
  products: ProductPerformance[];
  global_metrics: {
    total_spend: number;
    total_net_profit: number;
    blended_roas: number;
    blended_poas: number;
  };
  strategic_advice: string; // Executive summary from AI
  scaling_opportunities: string[]; // List of products to scale
}

// --- Market News Types ---

export interface NewsItem {
  title: string;
  source: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  url: string;
  published_time?: string;
}

export interface MarketTrend {
  topic: string;
  volume: 'HIGH' | 'MEDIUM' | 'LOW';
  growth_rate: string; // e.g. "+150%"
  context: string;
}

export interface MarketNewsResult {
  industry: string;
  news_feed: NewsItem[];
  trending_topics: MarketTrend[];
  real_time_analysis: string;
  marketing_implications: string[];
}

// --- Meta/Instagram Trends Types ---

export interface MemeTrend {
  name: string;
  description: string;
  visual_style: string; // e.g. "CapCut Template", "Static Tweet"
  viral_reason: string;
  example_hook: string;
  example_text_overlay: string;
}

export interface AudioTrend {
  name: string;
  mood: string;
  usage_context: string; // How brands are using it
}

export interface MetaTrendResult {
  viral_memes: MemeTrend[];
  trending_audio: AudioTrend[];
  ad_formats: string[]; // e.g. "Green Screen", "POV"
  deep_strategy: string; // Strategic breakdown
  actionable_hooks: string[]; // List of hooks to copy-paste
}

// --- Omniscience Engine Types ---

export interface RedditForensics {
  vulnerability_vector: { issue: string; source: string; engagement_level: string }[];
  feature_gap_analysis: { missing_feature: string; customer_demand: string; usp_roadmap: string }[];
  slang_and_lingo: string[];
}

export interface VideoCreativeBlueprint {
  concept_name: string;
  pattern_interrupt_hooks: {
    confrontational: string;
    social_proof: string;
  };
  visual_proof: string; // 3-15 seconds B-roll/UGC suggestion
  regret_minimization_cta: string;
}

export interface MarketForensicsReport {
  sentiment_heatmap: { frustration_level: string; attack_timing: string; platforms_analyzed: string };
  competitor_blindspots: { ignored_feature: string; new_ad_angle: string }[];
  content_dna: { viral_element: string; script_template: string }[];
  platform_specific_hooks: {
    tiktok: string;
    youtube: string;
    instagram: string;
  };
}

export interface OmniscienceResult {
  reddit_forensics: RedditForensics;
  video_creative_blueprints: VideoCreativeBlueprint[];
  market_forensics_report: MarketForensicsReport;
  msme_strategic_implementation: {
    cost_elimination: string;
    data_backed_spending: string;
    rapid_iteration: string;
  };
}

// --- Influencer Asset Lab Types ---

export interface DeepPriceAnalysis {
  estimated_cpm: string;
  negotiation_leverage: string;
  hidden_costs: string;
}

export interface InfluencerAsset {
  name: string;
  platform: string; // e.g., "Instagram", "YouTube", "LinkedIn"
  category: 'Safe Bet' | 'High-Growth';
  why_them: string;
  why_platform: string;
  predictive_poas: number; // e.g., 2.5 (Profit on Ad Spend)
  hook: string;
  creative_brief: string;
  approx_allocation: string;
  price_analysis: DeepPriceAnalysis;
}

export interface InfluencerBudgetSplit {
  safe_bets_percentage: number;
  high_growth_percentage: number;
  reasoning: string;
}

export interface InfluencerMarketingResult {
  influencers: InfluencerAsset[];
  budget_split: InfluencerBudgetSplit;
  strategic_summary: string;
}

// --- Data-to-Message Pipeline Types ---

export interface HighImpactPoint {
  pain_point: string;
  desired_outcome: string;
  customer_lingo: string[];
  source_vulnerability: string;
}

export interface TargetDemographic {
  age_group: string;
  geography: string;
  behavioral_trait: string;
}

export interface DispatchTiming {
  whatsapp: string;
  email: string;
  reasoning: string;
}

export interface ChannelMessage {
  campaign_name: string;
  target_demographic: TargetDemographic;
  optimal_dispatch_time: DispatchTiming;
  hook: string;
  whatsapp_copy: string;
  email_subject: string;
  email_body: string;
  social_proof_quote: string;
}

export interface MessagePipelineResult {
  extracted_points: HighImpactPoint[];
  campaigns: ChannelMessage[];
  strategic_summary: string;
}