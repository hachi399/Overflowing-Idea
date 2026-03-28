import { LanguageCode } from "./constants/translations";
export type { LanguageCode };

export type CreativityLevel = 'Normal' | 'Creative' | 'Quirky';

export interface MindNode {
  id: string;
  word: string;
  children?: MindNode[];
}

export interface MindMapData {
  seed: string;
  nodes: MindNode[];
  detectedLanguage: LanguageCode;
}

export interface BusinessConcept {
  title: string;
  summary: string;
  structure: string;
  scenario: string;
  differentiation: string;
  evaluation: {
    feasibility: number;
    novelty: number;
    marketability: number;
    reason: string;
  };
  imageUrl?: string;
  requirements?: string;
}

export interface IdeaHistory {
  id: string;
  timestamp: number;
  seed: string;
  selectedKeywords: string[];
  concept: BusinessConcept;
  language: LanguageCode;
}
