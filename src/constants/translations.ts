export type LanguageCode = 'en' | 'ja';

export interface TranslationStrings {
  appTitle: string;
  appSubtitle: string;
  seedPlaceholder: string;
  creativityLevel: string;
  generateMap: string;
  generatingMap: string;
  selected: string;
  createInnovation: string;
  synthesizing: string;
  innovationConcept: string;
  feasibility: string;
  novelty: string;
  marketability: string;
  summary: string;
  structure: string;
  usageScenario: string;
  investorEvaluation: string;
  generateImage: string;
  generateRequirements: string;
  requirementsGenerated: string;
  exportPdf: string;
  history: string;
  noHistory: string;
  copyRequirements: string;
  copied: string;
  visualizeIdea: string;
  connectingNeurons: string;
  seedLabel: string;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
  en: {
    appTitle: "Overflowing Idea",
    appSubtitle: "Idea Fountain",
    seedPlaceholder: "Enter a seed word (e.g., AI, Coffee, Travel...)",
    creativityLevel: "Creativity Level:",
    generateMap: "Generate Map",
    generatingMap: "Generating your mind map...",
    selected: "Selected",
    createInnovation: "Create Innovation",
    synthesizing: "Synthesizing Concept...",
    innovationConcept: "Innovation Concept",
    feasibility: "Feasibility",
    novelty: "Novelty",
    marketability: "Marketability",
    summary: "Summary",
    structure: "Structure",
    usageScenario: "Usage Scenario",
    investorEvaluation: "Investor Evaluation",
    generateImage: "Generate Image",
    generateRequirements: "Generate Requirements Doc",
    requirementsGenerated: "Requirements Generated",
    exportPdf: "Export as PDF",
    history: "History",
    noHistory: "No ideas saved yet.",
    copyRequirements: "Copy Requirements",
    copied: "Copied!",
    visualizeIdea: "Visualize your idea with AI",
    connectingNeurons: "Connecting neurons and associations",
    seedLabel: "Seed",
  },
  ja: {
    appTitle: "Overflowing Idea",
    appSubtitle: "アイディアの泉",
    seedPlaceholder: "シードワードを入力（例：AI、コーヒー、旅行...）",
    creativityLevel: "創造性レベル:",
    generateMap: "マップ生成",
    generatingMap: "マインドマップを生成中...",
    selected: "選択済み",
    createInnovation: "イノベーション生成",
    synthesizing: "コンセプトを合成中...",
    innovationConcept: "イノベーションコンセプト",
    feasibility: "実現可能性",
    novelty: "新規性",
    marketability: "市場性",
    summary: "概要",
    structure: "構造",
    usageScenario: "利用シナリオ",
    investorEvaluation: "投資家評価",
    generateImage: "イメージ生成",
    generateRequirements: "要件定義書生成",
    requirementsGenerated: "要件定義書生成済み",
    exportPdf: "PDFエクスポート",
    history: "履歴",
    noHistory: "履歴はまだありません。",
    copyRequirements: "要件定義書をコピー",
    copied: "コピーしました！",
    visualizeIdea: "AIでアイディアを視覚化",
    connectingNeurons: "ニューロンと連想を接続中",
    seedLabel: "シード",
  }
};
