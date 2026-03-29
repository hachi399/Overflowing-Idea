import { GoogleGenAI, Type } from "@google/genai";
import { BusinessConcept, CreativityLevel, LanguageCode, MindNode } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key is not configured. Please check your environment variables.");
  throw new Error("Gemini API key is missing. Ensure VITE_GEMINI_API_KEY is set in your environment.");
}

if (!apiKey.startsWith("AIza")) {
  console.error("Invalid Gemini API key format. API key should start with 'AIza'.");
  throw new Error("Invalid Gemini API key format.");
}

const ai = new GoogleGenAI({ apiKey });

export const generateMindMap = async (seed: string, level: CreativityLevel): Promise<{ nodes: MindNode[], language: LanguageCode }> => {
  console.log("Generating mind map for seed:", seed, "level:", level);

  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `Generate a 2-level hierarchical mind map of associated words starting from the seed word: "${seed}".
    Creativity Level: ${level}.
    Level 1 should have 6-8 nodes.
    Level 2 (children of Level 1) should have 3-4 nodes each.
    The language of the output should match the language of the seed word.
    Also, identify the language of the seed word and return it as an ISO 639-1 code (e.g., 'en', 'ja').
    Return the data as a JSON object with "nodes" and "language" fields.`;

    console.log("Calling Gemini API for mind map generation...");
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

    console.log("Gemini API response received:", response);

    if (!response.text) {
      console.error("No response text from Gemini API");
      throw new Error("Empty response from Gemini API");
    }

    try {
      const data = JSON.parse(response.text);
      console.log("Parsed response data:", data);
      return {
        nodes: data.nodes,
        language: (data.language === 'ja' ? 'ja' : 'en') as LanguageCode
      };
    } catch (parseError) {
      console.error("Failed to parse mind map response JSON:", parseError, "Response text:", response.text);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in generateMindMap:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or expired. Please check your API key configuration.");
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
      throw new Error("Network error while calling Gemini API. Check your internet connection.");
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
};

export const generateConcept = async (seed: string, keywords: string[]): Promise<BusinessConcept> => {
  console.log("Generating concept for seed:", seed, "keywords:", keywords);

  try {
    const model = "gemini-3-flash-preview";
    
    const prompt = `Create an innovative business concept by combining the seed word "${seed}" and these keywords: ${keywords.join(", ")}.
    Provide a title, summary, structure, usage scenario, and differentiation points.
    Also evaluate the idea on Feasibility, Novelty, and Marketability (0-100) with a detailed reason.
    The language of the output should match the language of the keywords.`;

    console.log("Calling Gemini API for concept generation...");
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

    console.log("Gemini API response received for concept:", response);

    if (!response.text) {
      console.error("No response text from Gemini API for concept generation");
      throw new Error("Empty response from Gemini API");
    }

    try {
      const data = JSON.parse(response.text);
      console.log("Parsed concept response data:", data);
      return data;
    } catch (parseError) {
      console.error("Failed to parse concept response JSON:", parseError, "Response text:", response.text);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("Error in generateConcept:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or expired. Please check your API key configuration.");
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
      throw new Error("Network error while calling Gemini API. Check your internet connection.");
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
};

export const generateConceptImage = async (concept: BusinessConcept): Promise<string | undefined> => {
  console.log("Generating image for concept:", concept.title);

  try {
    const model = "gemini-2.5-flash-image";
    
    const prompt = `A high-quality, professional visualization of this business concept: ${concept.title}. ${concept.summary}. Modern, clean, innovative style.`;

    console.log("Calling Gemini API for image generation...");
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

    console.log("Gemini API response received for image:", response);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        console.log("Image data found in response");
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    console.warn("No image data found in Gemini API response");
    return undefined;
  } catch (error) {
    console.error("Error in generateConceptImage:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or expired. Please check your API key configuration.");
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
      throw new Error("Network error while calling Gemini API. Check your internet connection.");
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
};

export const generateRequirementsDoc = async (concept: BusinessConcept): Promise<string> => {
  console.log("Generating requirements document for concept:", concept.title);

  try {
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

    console.log("Calling Gemini API for requirements document generation...");
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    console.log("Gemini API response received for requirements doc:", response);

    if (!response.text) {
      console.error("No response text from Gemini API for requirements document");
      throw new Error("Empty response from Gemini API");
    }

    console.log("Requirements document generated successfully");
    return response.text;
  } catch (error) {
    console.error("Error in generateRequirementsDoc:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or expired. Please check your API key configuration.");
    } else if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
      throw new Error("Network error while calling Gemini API. Check your internet connection.");
    } else {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
};
