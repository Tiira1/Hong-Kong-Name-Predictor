import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NamePrediction {
  syllables: {
    pinyin: string;
    suggestions: {
      char: string;
      meaning?: string;
    }[];
  }[];
  fullNames: {
    chinese: string;
    jyutping: string;
    explanation: string;
  }[];
}

export async function predictHKName(pinyin: string, gender: string): Promise<NamePrediction> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Predict Hong Kong Traditional Chinese names for the Cantonese Pinyin: "${pinyin}" with gender: "${gender}".
    
    Rules:
    1. Use Hong Kong naming conventions (Traditional Chinese).
    2. For each syllable in the Pinyin, provide the most likely characters ranked by probability.
    3. Suggest 3-5 complete full name combinations.
    4. For each full name, provide the standard Cantonese Jyutping (with tones).
    5. Explain why these names are common for the given gender.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          syllables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pinyin: { type: Type.STRING },
                suggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      char: { type: Type.STRING },
                      meaning: { type: Type.STRING }
                    },
                    required: ["char"]
                  }
                }
              },
              required: ["pinyin", "suggestions"]
            }
          },
          fullNames: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chinese: { type: Type.STRING },
                jyutping: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["chinese", "jyutping", "explanation"]
            }
          }
        },
        required: ["syllables", "fullNames"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid response from AI");
  }
}
