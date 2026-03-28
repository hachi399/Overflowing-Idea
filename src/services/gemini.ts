import { GoogleGenAI, Type } from "@google/genai";
import { BusinessConcept, CreativityLevel, LanguageCode, MindNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMindMap = async (seed: string, level: CreativityLevel): Promise<{ nodes: MindNode[], language: LanguageCode }> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a 2-level hierarchical mind map of associated words starting from the seed word: "${seed}".
  Creativity Level: ${level}.
  Level 1 should have 6-8 nodes.
  Level 2 (children of Level 1) should have 3-4 nodes each.
  The language of the output should match the language of the seed word.
  Also, identify the language of the seed word and return it as an ISO 639-1 code (e.g., 'en', 'ja').
  Return the data as a JSON object with "nodes" and "language" fields.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          language: { type: Type.STRING, description: "ISO 639-1 language code" },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                word: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      word: { type: Type.STRING }
                    },
                    required: ["id", "word"]
                  }
                }
              },
              required: ["id", "word"]
            }
          }
        },
        required: ["nodes", "language"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      nodes: data.nodes,
      language: (data.language === 'ja' ? 'ja' : 'en') as LanguageCode
    };
  } catch (e) {
    console.error("Failed to parse mind map response", e);
    return { nodes: [], language: 'en' };
  }
};

export const generateConcept = async (seed: string, keywords: string[]): Promise<BusinessConcept> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Create an innovative business concept by combining the seed word "${seed}" and these keywords: ${keywords.join(", ")}.
  Provide a title, summary, structure, usage scenario, and differentiation points.
  Also evaluate the idea on Feasibility, Novelty, and Marketability (0-100) with a detailed reason.
  The language of the output should match the language of the keywords.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          structure: { type: Type.STRING },
          scenario: { type: Type.STRING },
          differentiation: { type: Type.STRING },
          evaluation: {
            type: Type.OBJECT,
            properties: {
              feasibility: { type: Type.NUMBER },
              novelty: { type: Type.NUMBER },
              marketability: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["feasibility", "novelty", "marketability", "reason"]
          }
        },
        required: ["title", "summary", "structure", "scenario", "differentiation", "evaluation"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateConceptImage = async (concept: BusinessConcept): Promise<string | undefined> => {
  const model = "gemini-2.5-flash-image";
  
  const prompt = `A high-quality, professional visualization of this business concept: ${concept.title}. ${concept.summary}. Modern, clean, innovative style.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};

export const generateRequirementsDoc = async (concept: BusinessConcept): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a detailed Requirements Definition Document for the following business concept:
  Title: ${concept.title}
  Summary: ${concept.summary}
  Structure: ${concept.structure}
  
  The document should include:
  1. Project Overview
  2. Target Users
  3. Key Features
  4. Technical Stack Recommendations
  5. UI/UX Requirements
  6. Future Roadmap
  
  Format the output in Markdown. The language should match the concept's language.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text || "";
};
